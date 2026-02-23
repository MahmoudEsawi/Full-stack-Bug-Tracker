import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns'; // We'll install date-fns next
import { jwtDecode } from 'jwt-decode';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Sidebar from '../components/Sidebar';

const API_URL = '/api/tickets';

function Dashboard({ token, handleLogout }) {
  const [tickets, setTickets] = useState([]);
  const [newTicket, setNewTicket] = useState({ title: '', description: '', priority: 'Low' });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Phase 4 States
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({ username: '', password: '' });

  // Phase 6 States
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // Extract User info from Token
  const decodedToken = jwtDecode(token);

  // Set initial username for profile form
  useEffect(() => {
    if (decodedToken?.user?.username) {
      setProfileData(prev => ({ ...prev, username: decodedToken.user.username }));
    }
  }, [decodedToken?.user?.username]);

  // Setup Axios Auth Header
  const authConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  // Handle Theme Changes
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Fetch notifications and projects on mount
  useEffect(() => {
    if (decodedToken?.user?.teamId) {
      fetchProjects();
      fetchNotifications();
    }
  }, [decodedToken?.user?.teamId]);

  // Fetch tickets when selected project changes
  useEffect(() => {
    if (selectedProjectId) {
      fetchTickets();
    } else {
      setTickets([]);
    }
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('/api/projects', authConfig);
      setProjects(res.data);
      // Auto-select first project if none is selected
      if (res.data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(res.data[0]._id);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchTickets = async () => {
    if (!selectedProjectId) return;
    try {
      const url = `/api/tickets?projectId=${selectedProjectId}`;
      const res = await axios.get(url, authConfig);
      setTickets(res.data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications', authConfig);
      setNotifications(res.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleMarkNotificationRead = async (id, relatedTicketId) => {
    try {
      await axios.put(`/api/notifications/${id}/read`, {}, authConfig);
      fetchNotifications();

      // If there's a related ticket, open it automatically
      setShowNotifications(false);
      if (relatedTicketId) {
        const ticketToOpen = tickets.find(t => t._id === relatedTicketId);
        if (ticketToOpen) setSelectedTicket(ticketToOpen);
      }
    } catch (error) {
      console.error("Error marking notification read:", error);
    }
  };

  // Submit new ticket
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) {
      return alert("Please select or create a project first.");
    }

    try {
      await axios.post(API_URL, { ...newTicket, projectId: selectedProjectId }, authConfig);
      setNewTicket({ ...newTicket, title: '', description: '' });
      fetchTickets();
    } catch (error) {
      console.error("Error adding ticket:", error);
    }
  };

  // Update ticket to any Custom status
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await axios.put(`${API_URL}/${id}`, { status: newStatus }, authConfig);
      fetchTickets();
    } catch (error) {
      console.error("Error updating ticket status:", error);
    }
  };

  // Delete ticket
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`, authConfig);
      fetchTickets();
    } catch (error) {
      console.error("Error deleting ticket:", error);
    }
  };

  // Handle Drag and Drop End
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Optimistically update UI
    const updatedTickets = Array.from(tickets);
    const draggedTicket = updatedTickets.find(t => t._id === draggableId);
    if (!draggedTicket) return;

    if (destination.droppableId !== source.droppableId) {
      draggedTicket.status = destination.droppableId;
      setTickets(updatedTickets);

      // Update Backend
      await handleUpdateStatus(draggableId, destination.droppableId);
    }
  };

  // Add Comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedTicket) return;
    try {
      const res = await axios.post(`${API_URL}/${selectedTicket._id}/comments`, { text: newComment }, authConfig);
      setSelectedTicket(res.data); // Update modal view
      setNewComment('');
      fetchTickets(); // Update background board
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // Update Profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/auth/profile', profileData, authConfig);
      alert('Profile updated successfully! If you changed your password, you may need to re-login.');
      setShowProfileModal(false);
      setProfileData({ ...profileData, password: '' }); // Clear password field
    } catch (error) {
      console.error("Error updating profile:", error);
      alert('Failed to update profile.');
    }
  };

  // Filter tickets based on search query
  const filteredTickets = tickets.filter(ticket =>
    ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Dashboard Data Setup ---
  const resolvedCount = tickets.filter(t => t.status === 'Resolved').length;
  const openCount = tickets.length - resolvedCount;

  const chartData = [
    { name: 'Active Bugs', value: openCount },
    { name: 'Resolved', value: resolvedCount },
  ];

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const COLORS = ['#ef4444', '#22c55e']; // Red for active, Green for resolved

  // Kanban Columns Data Structure
  const columns = [
    { title: 'Open', status: 'Open', color: 'indigo-500', bg: 'glass-panel', border: 'border-indigo-500/20' },
    { title: 'In Progress', status: 'In Progress', color: 'fuchsia-500', bg: 'glass-panel', border: 'border-fuchsia-500/20' },
    { title: 'Resolved', status: 'Resolved', color: 'emerald-500', bg: 'glass-panel', border: 'border-emerald-500/20' }
  ];

  const renderTicketCard = (ticket, provided) => (
    <div
      key={ticket._id}
      ref={provided?.innerRef}
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
      style={{ ...provided?.draggableProps.style }}
      className="group p-6 rounded-2xl theme-glass theme-border border hover:border-indigo-400/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] relative flex flex-col h-full mb-4"
    >

      {/* Top Banner (Priority & Date) */}
      <div className="flex justify-between items-start mb-4">
        <span className={`shrink-0 px-2.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 ${ticket.priority === 'High' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
          ticket.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
            'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
          }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${ticket.priority === 'High' ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : ticket.priority === 'Medium' ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 'bg-indigo-500 shadow-[0_0_8px_#6366f1]'}`}></span>
          {ticket.priority}
        </span>
        <span className="text-[10px] font-bold theme-muted">
          {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : ''}
        </span>
      </div>

      <h3 className={`text-[17px] font-bold mb-3 ${ticket.status === 'Resolved' ? 'theme-muted line-through opacity-75' : 'theme-text'}`}>
        {ticket.title}
      </h3>

      <p className={`text-[13px] theme-muted mb-6 leading-relaxed font-medium flex-1 ${ticket.status === 'Resolved' ? 'opacity-50' : ''}`}>
        {ticket.description}
      </p>

      {/* Ticket History Metadata */}
      <div className="theme-panel p-3 rounded-xl border mb-4 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="theme-muted font-medium">Opened by:</span>
          <span className="font-bold theme-text">{ticket.user?.username || 'Unknown'}</span>
        </div>

        {ticket.status === 'Resolved' && ticket.closedBy && (
          <div className="flex justify-between items-center text-xs pt-2 border-t theme-border mt-2">
            <span className="text-emerald-500 font-medium">Closed by:</span>
            <span className="font-bold text-emerald-500">{ticket.closedBy?.username}</span>
          </div>
        )}

        <button
          onClick={() => setSelectedTicket(ticket)}
          className="w-full mt-3 py-2 text-xs font-bold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 hover:text-indigo-300 border border-indigo-500/20 rounded-lg transition-colors flex items-center justify-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          View Full Details
        </button>
      </div>

      {/* Kanban Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-auto pt-4 border-t theme-border">
        <div className="flex gap-2">
          {ticket.status !== 'Open' && (
            <button onClick={() => handleUpdateStatus(ticket._id, 'Open')} className="theme-muted hover:text-indigo-500 hover:theme-panel theme-border border border-transparent hover:border-indigo-500/20 p-2 rounded-xl transition-colors" title="Move to Open">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </button>
          )}
          {ticket.status === 'Open' && (
            <button onClick={() => handleUpdateStatus(ticket._id, 'In Progress')} className="theme-muted hover:text-fuchsia-500 hover:theme-panel border border-transparent hover:border-fuchsia-500/20 p-2 rounded-xl transition-colors" title="Move to In Progress">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </button>
          )}
          {ticket.status === 'In Progress' && (
            <button onClick={() => handleUpdateStatus(ticket._id, 'Resolved')} className="theme-muted hover:text-emerald-500 hover:theme-panel border border-transparent hover:border-emerald-500/20 p-2 rounded-xl transition-colors" title="Resolve Issue">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
            </button>
          )}
        </div>

        <button onClick={() => handleDelete(ticket._id)} className="theme-muted hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 p-2 rounded-xl transition-colors ml-auto" title="Delete Ticket">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen theme-bg font-sans theme-text flex flex-col md:flex-row relative overflow-hidden transition-colors duration-500">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none transition-opacity" style={{ background: 'var(--ambient-glow-1)', filter: 'blur(120px)' }}></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none transition-opacity" style={{ background: 'var(--ambient-glow-2)', filter: 'blur(100px)' }}></div>

      <Sidebar
        token={token}
        handleLogout={handleLogout}
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenProfile={() => {
          setIsSidebarOpen(false);
          setShowProfileModal(true);
        }}
        theme={theme}
        toggleTheme={toggleTheme}
        projects={projects}
        fetchProjects={fetchProjects}
        selectedProjectId={selectedProjectId}
        setSelectedProjectId={setSelectedProjectId}
      />

      <main className={`flex-1 p-4 md:p-8 h-screen overflow-y-auto relative z-10 custom-scrollbar transition-all duration-400 ${!isSidebarOpen ? 'md:pl-20' : ''}`}>
        <div className="w-full max-w-7xl mx-auto">

          {/* Permanent Sidebar Toggle (Visible when sidebar is closed) */}
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="fixed top-8 left-6 z-40 p-3 rounded-2xl theme-panel theme-border border shadow-lg theme-muted hover:text-indigo-500 hover:border-indigo-500/30 transition-all group"
              title="Open Workspace Portal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 group-hover:scale-110 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          )}

          {/* Header Section */}
          <header className="mb-10 flex flex-col md:flex-row justify-between md:items-center glass-panel p-6 md:p-8 rounded-[2rem] shadow-2xl shadow-black/20 gap-6">
            <div className="w-full md:w-auto flex justify-between items-center">
              <div>
                <h1 className="text-3xl md:text-5xl font-black theme-text tracking-tight mb-2 md:mb-3">
                  <span className="text-indigo-500 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-fuchsia-500">Nexus</span> Tracker
                </h1>
                <p className="theme-muted font-medium text-sm md:text-lg tracking-wide uppercase text-[10px] tracking-widest mt-1">Professional Issue Management</p>
              </div>
            </div>
            {decodedToken?.user?.teamId && (
              <div className="flex items-center gap-2 sm:gap-4 flex-wrap">

                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className="p-3 theme-panel rounded-2xl theme-muted theme-hover transition-colors relative"
                  title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  {theme === 'dark' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 hover:text-amber-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 hover:text-indigo-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                    </svg>
                  )}
                </button>

                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-3 theme-panel rounded-2xl theme-muted theme-hover transition-colors relative"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 hover:text-indigo-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute top-2 right-2 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fuchsia-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-fuchsia-500 border-2 border-[#131C31]"></span>
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 sm:-right-4 mt-3 w-[280px] sm:w-80 max-w-[90vw] theme-panel backdrop-blur-3xl rounded-2xl shadow-2xl overflow-hidden z-50 animate-[scale-in_0.2s_ease-out] origin-top-right">
                      <div className="bg-black/20 p-4 border-b theme-border flex justify-between items-center">
                        <h4 className="font-bold theme-text">Notifications</h4>
                        {unreadCount > 0 && <span className="bg-indigo-500/20 text-indigo-500 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-indigo-500/30">{unreadCount} New</span>}
                      </div>
                      <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center theme-muted text-sm font-medium">No inner peace is better than an empty inbox. 🍃</div>
                        ) : (
                          notifications.map(note => (
                            <div
                              key={note._id}
                              onClick={() => handleMarkNotificationRead(note._id, note.relatedTicket?._id)}
                              className={`p-4 border-b theme-border theme-hover cursor-pointer transition-colors ${!note.isRead ? 'bg-indigo-500/10' : 'opacity-60'}`}
                            >
                              <p className={`text-sm ${!note.isRead ? 'font-bold theme-text' : 'font-medium theme-muted'}`}>
                                {note.message}
                              </p>
                              <p className="text-[10px] font-bold theme-muted mt-2 uppercase tracking-wider opacity-70">
                                {format(new Date(note.createdAt), 'MMM d, h:mm a')}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="theme-panel px-6 py-4 rounded-2xl shadow-sm hidden sm:block">
                  <span className="block text-xs theme-muted uppercase font-bold tracking-wider mb-1">Total Issues</span>
                  <span className="text-2xl font-black theme-text">{tickets.length}</span>
                </div>
                <div className="bg-emerald-500/10 px-6 py-4 rounded-2xl border border-emerald-500/20 shadow-sm hidden md:block">
                  <span className="block text-xs text-emerald-500 uppercase font-bold tracking-wider mb-1">Resolved</span>
                  <span className="text-2xl font-black text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">{resolvedCount}</span>
                </div>
              </div>
            )}
          </header>

          {/* State: No Team */}
          {!decodedToken?.user?.teamId ? (
            <div className="theme-panel p-16 rounded-[2rem] shadow-2xl shadow-black/20 text-center relative overflow-hidden backdrop-blur-3xl">
              <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 blur-[100px] rounded-full"></div>
              <div className="w-24 h-24 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                <span className="text-4xl text-indigo-500">❖</span>
              </div>
              <h2 className="text-3xl font-black theme-text mb-4 relative z-10">Welcome to <span className="text-indigo-500 drop-shadow-[0_0_10px_rgba(99,102,241,0.4)]">Nexus</span></h2>
              <p className="theme-muted font-medium max-w-lg mx-auto leading-relaxed relative z-10">
                To get started, please create a new workspace or join an existing one using the options in the sidebar.
              </p>
            </div>
          ) : (
            <>

              {/* --- Dashboard / Charts Section --- */}
              {tickets.length > 0 && (
                <div className="mb-10 glass-panel p-8 rounded-[2rem] shadow-2xl shadow-black/20 flex flex-col md:flex-row items-center gap-10">
                  <div className="w-full md:w-1/2">
                    <h2 className="text-2xl font-bold mb-4 theme-text flex items-center gap-3">
                      <span className="bg-indigo-500 shadow-[0_0_10px_#6366f1] w-2 h-8 rounded-full"></span> System Health
                    </h2>
                    <p className="theme-muted leading-relaxed mb-6 text-lg">
                      Track your bug resolution rate in real-time. Currently, you have <strong className="text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">{openCount}</strong> active issues out of <strong className="theme-text">{tickets.length}</strong> total reported bugs.
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full theme-input rounded-full h-3 relative overflow-hidden shadow-inner border theme-border">
                      <div
                        className="bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_10px_#10b981] h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${(resolvedCount / (tickets.length || 1)) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-right text-sm mt-3 theme-muted font-bold">
                      <span className="text-emerald-500">{Math.round((resolvedCount / (tickets.length || 1)) * 100)}%</span> Resolved
                    </p>
                  </div>

                  <div className="w-full md:w-1/2 h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f8fafc', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)' }}
                          itemStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                        />
                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#94a3b8', fontWeight: '600' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Report New Ticket Bar */}
              <div className="mb-10 relative z-20">
                <div className="mb-5 flex items-center gap-3 px-2">
                  <h3 className="text-xl md:text-2xl font-black theme-text flex items-center gap-2">
                    <span className="text-indigo-500">❖</span>
                    {projects.find(p => p._id === selectedProjectId)?.name || 'Select a Project'}
                  </h3>
                  <span className="theme-panel theme-muted border-none text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest hidden sm:inline-block shadow-[0_4px_10px_rgba(0,0,0,0.3)]">Active Workspace</span>
                </div>
                <form onSubmit={handleSubmit} className="theme-panel backdrop-blur-xl p-6 rounded-2xl shadow-xl flex flex-col lg:flex-row gap-5 items-end">
                  <div className="w-full lg:flex-1">
                    <label className="block text-xs font-bold theme-muted tracking-wider uppercase mb-2 ml-1">Issue Title</label>
                    <input type="text" placeholder="e.g. Broken links..." required className="w-full p-3.5 theme-input rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium text-sm transition-all shadow-inner" value={newTicket.title} onChange={e => setNewTicket({ ...newTicket, title: e.target.value })} />
                  </div>
                  <div className="w-full lg:flex-[1.5]">
                    <label className="block text-xs font-bold theme-muted tracking-wider uppercase mb-2 ml-1">Context</label>
                    <input type="text" placeholder="Short description..." required className="w-full p-3.5 theme-input rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium text-sm transition-all shadow-inner" value={newTicket.description} onChange={e => setNewTicket({ ...newTicket, description: e.target.value })} />
                  </div>
                  <div className="w-full lg:w-40 shrink-0">
                    <label className="block text-xs font-bold theme-muted tracking-wider uppercase mb-2 ml-1">Priority</label>
                    <select className="w-full p-3.5 theme-input rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-sm transition-all shadow-inner" value={newTicket.priority} onChange={e => setNewTicket({ ...newTicket, priority: e.target.value })}>
                      <option className="theme-bg" value="Low">Low</option><option className="theme-bg" value="Medium">Medium</option><option className="theme-bg" value="High">High</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full lg:w-auto bg-indigo-600/90 text-white font-bold px-8 py-3.5 rounded-xl border border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:bg-indigo-500 transition-all text-sm shrink-0 whitespace-nowrap">
                    + Add Issue
                  </button>
                </form>
              </div>

              {/* Trello Board Grid */}
              <div className="flex flex-col xl:flex-row gap-6 overflow-x-auto pb-6 custom-scrollbar items-start min-h-[500px]">
                <DragDropContext onDragEnd={onDragEnd}>
                  {columns.map(col => {
                    const colTickets = filteredTickets.filter(t => t.status === col.status);

                    return (
                      <Droppable key={col.status} droppableId={col.status}>
                        {(provided, snapshot) => (
                          <div
                            className={`flex-[1] xl:w-[350px] min-w-[280px] sm:min-w-[320px] rounded-[2rem] border theme-border theme-panel p-4 flex flex-col shadow-inner max-h-[70vh] ${snapshot.isDraggingOver ? 'bg-indigo-500/10' : ''}`}
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            {/* Column Header */}
                            <div className="flex justify-between items-center mb-6 px-2 pt-2 shrink-0">
                              <h2 className="text-lg font-black theme-text flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full bg-${col.color}`}></span>
                                {col.title}
                              </h2>
                              <span className="theme-bg theme-muted shadow-sm border theme-border text-xs px-2.5 py-1 rounded-full font-bold">
                                {colTickets.length}
                              </span>
                            </div>

                            {/* Column Cards Container */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-3 min-h-0">
                              {colTickets.length === 0 && !snapshot.isDraggingOver ? (
                                <div className="flex-1 border-2 border-dashed theme-border rounded-2xl flex items-center justify-center min-h-[150px] opacity-50">
                                  <span className="theme-muted font-bold text-sm">Drop here</span>
                                </div>
                              ) : (
                                colTickets.map((ticket, index) => (
                                  <Draggable key={ticket._id} draggableId={ticket._id} index={index}>
                                    {(provided) => renderTicketCard(ticket, provided)}
                                  </Draggable>
                                ))
                              )}
                              {provided.placeholder}
                            </div>
                          </div>
                        )}
                      </Droppable>
                    );
                  })}
                  {/* End Columns Map */}
                </DragDropContext>
              </div>
            </>
          )}

          {/* Footer */}
          <footer className="mt-16 text-center theme-muted text-sm font-medium pb-8 relative z-20">
            <p className="flex items-center justify-center gap-2">
              Built with <span className="text-red-500 text-lg drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">❤️</span> by <a href="https://github.com/MahmoudEsawi" target="_blank" rel="noreferrer" className="text-indigo-500 hover:text-indigo-400 font-bold hover:underline transition-colors lg:bg-indigo-500/10 lg:px-2 lg:py-0.5 lg:rounded-md lg:border lg:border-indigo-500/20">Mahmoud Esawi</a>
            </p>
          </footer>

          {/* Ticket Details & Comments Modal */}
          {selectedTicket && (
            <div className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-8 transition-colors">
              <div className="theme-panel rounded-[2rem] shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-[scale-in_0.2s_ease-out]">

                {/* Modal Header */}
                <div className="p-6 theme-border border-b flex justify-between items-center theme-bg shrink-0">
                  <h3 className="text-xl font-black theme-text flex items-center gap-3">
                    <span className="bg-indigo-500/20 border border-indigo-500/30 p-2 rounded-xl text-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </span>
                    Ticket Details: {selectedTicket.title}
                  </h3>
                  <button onClick={() => setSelectedTicket(null)} className="theme-muted hover:text-red-500 hover:bg-red-500/10 p-2 rounded-xl transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                {/* Modal Body - 2 Columns */}
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-0 relative">

                  {/* Left Column: Timeline & Meta */}
                  <div className="w-full md:w-1/3 border-r theme-border theme-bg p-6 md:p-8 overflow-y-auto custom-scrollbar">
                    <div className="mb-8">
                      <h4 className="text-sm font-bold theme-muted uppercase tracking-widest mb-2">Description</h4>
                      <p className="theme-text font-medium leading-relaxed theme-input p-4 rounded-xl">{selectedTicket.description}</p>
                    </div>

                    <h4 className="text-sm font-bold theme-muted uppercase tracking-widest mb-6">Activity Timeline</h4>
                    <div className="relative pl-6 border-l-2 theme-border space-y-8">
                      {/* Creation Event */}
                      <div className="relative">
                        <div className="absolute -left-[35px] theme-bg p-1 rounded-full border-2 theme-border">
                          <div className="w-3 h-3 bg-indigo-500 shadow-[0_0_8px_#6366f1] rounded-full"></div>
                        </div>
                        <p className="text-xs font-bold theme-muted mb-1">
                          {selectedTicket.createdAt ? format(new Date(selectedTicket.createdAt), 'MMM d, h:mm a') : 'Unknown Date'}
                        </p>
                        <p className="text-sm font-medium theme-text theme-input p-4 rounded-xl shadow-sm">
                          Opened by <strong className="text-indigo-500">{selectedTicket.user?.username || 'Unknown'}</strong>.
                        </p>
                      </div>

                      {/* Closing Event */}
                      {selectedTicket.status === 'Resolved' && (
                        <div className="relative">
                          <div className="absolute -left-[35px] theme-input p-1 rounded-full border-2 border-emerald-500/30">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]"></div>
                          </div>
                          <p className="text-xs font-bold text-emerald-500 mb-1">
                            {selectedTicket.closedAt ? format(new Date(selectedTicket.closedAt), 'MMM d, h:mm a') : 'Unknown Date'}
                          </p>
                          <p className="text-sm font-medium text-slate-300 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 shadow-sm">
                            Resolved by <strong className="text-emerald-400">{selectedTicket.closedBy?.username || 'Unknown'}</strong>.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Comments Thread */}
                  <div className="w-full md:w-2/3 flex flex-col bg-transparent overflow-hidden min-h-[400px]">
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-6 flex flex-col">
                      {(!selectedTicket.comments || selectedTicket.comments.length === 0) ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-60 m-auto">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mb-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                          </svg>
                          <p className="font-bold text-white">No comments yet.</p>
                          <p className="text-sm">Start the conversation below.</p>
                        </div>
                      ) : (
                        selectedTicket.comments.map((comment, idx) => {
                          const isMe = comment.user?._id === decodedToken?.user?.id;
                          return (
                            <div key={idx} className={`flex flex-col max-w-[85%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                              <span className="text-[11px] font-bold text-slate-400 mb-1 px-1">
                                {isMe ? 'You' : comment.user?.username} • {format(new Date(comment.createdAt), 'h:mm a')}
                              </span>
                              <div className={`px-5 py-3 rounded-2xl shadow-sm text-sm font-medium leading-relaxed ${isMe ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-slate-800/80 text-slate-200 rounded-tl-sm border border-slate-700/50'}`}>
                                {comment.text}
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>

                    {/* Chat Input Area */}
                    <div className="p-4 md:p-6 border-t border-slate-800/60 bg-slate-900/50 shrink-0">
                      <form onSubmit={handleAddComment} className="flex gap-3">
                        <input
                          type="text"
                          placeholder="Type your message..."
                          className="flex-1 bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm transition-all"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                        />
                        <button
                          type="submit"
                          disabled={!newComment.trim()}
                          className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-xl px-6 font-bold shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all flex items-center justify-center"
                        >
                          Send
                        </button>
                      </form>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* Profile Modal */}
          {showProfileModal && (
            <div className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-colors">
              <div className="theme-panel rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-[scale-in_0.2s_ease-out]">
                <div className="p-6 theme-border border-b flex justify-between items-center theme-bg">
                  <h3 className="text-xl font-black theme-text flex items-center gap-3">
                    <span className="bg-fuchsia-500/20 border border-fuchsia-500/30 p-2 rounded-xl text-fuchsia-500 shadow-[0_0_15px_rgba(217,70,239,0.2)]">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                    </span>
                    Profile Settings
                  </h3>
                  <button onClick={() => setShowProfileModal(false)} className="theme-muted hover:text-red-500 hover:bg-red-500/10 p-2 rounded-xl transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <form onSubmit={handleUpdateProfile} className="p-8 space-y-5 bg-transparent">
                  <div>
                    <label className="block text-xs font-bold theme-muted uppercase tracking-widest mb-2 ml-1">Username</label>
                    <input
                      type="text"
                      className="w-full p-4 theme-input rounded-xl focus:ring-2 focus:ring-fuchsia-500 font-medium text-sm transition-all shadow-inner"
                      value={profileData.username}
                      onChange={e => setProfileData({ ...profileData, username: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold theme-muted uppercase tracking-widest mb-2 ml-1">New Password</label>
                    <input
                      type="password"
                      placeholder="Leave blank to keep current password"
                      className="w-full p-4 theme-input rounded-xl focus:ring-2 focus:ring-fuchsia-500 font-medium text-sm transition-all shadow-inner"
                      value={profileData.password}
                      onChange={e => setProfileData({ ...profileData, password: e.target.value })}
                    />
                  </div>

                  <div className="pt-4">
                    <button type="submit" className="w-full bg-fuchsia-600 text-white font-bold px-6 py-4 rounded-xl shadow-[0_0_20px_rgba(217,70,239,0.4)] hover:shadow-[0_0_30px_rgba(217,70,239,0.6)] hover:bg-fuchsia-500 hover:-translate-y-0.5 transition-all text-sm whitespace-nowrap">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </main >
    </div >
  );
}

export default Dashboard;