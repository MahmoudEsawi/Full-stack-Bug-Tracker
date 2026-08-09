import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { jwtDecode } from 'jwt-decode';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const API_URL = '/api/tickets';

function Dashboard({ token, handleLogout }) {
  const [tickets, setTickets] = useState([]);
  const [newTicket, setNewTicket] = useState({ title: '', description: '', priority: 'Low' });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Mobile column view mode ('All' or specific column status)
  const [mobileActiveColumn, setMobileActiveColumn] = useState('All');
  // Modal active tab on mobile ('details' vs 'comments')
  const [modalTab, setModalTab] = useState('comments');

  // Notifications & Discussion states
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({ username: '', password: '' });

  // Theme & Project states
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
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
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
      if (res.data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(res.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchTickets = async () => {
    if (!selectedProjectId) return;
    try {
      const url = `/api/tickets?projectId=${selectedProjectId}`;
      const res = await axios.get(url, authConfig);
      setTickets(res.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications', authConfig);
      setNotifications(res.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleMarkNotificationRead = async (id, relatedTicketId) => {
    try {
      await axios.put(`/api/notifications/${id}/read`, {}, authConfig);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
      );
      if (relatedTicketId) {
        const ticketToOpen = tickets.find(t => t._id === relatedTicketId);
        if (ticketToOpen) {
          setSelectedTicket(ticketToOpen);
          setShowNotifications(false);
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Create Ticket
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProjectId) {
      alert('Please select or create a Project first before adding an issue.');
      return;
    }

    try {
      await axios.post(API_URL, { ...newTicket, projectId: selectedProjectId }, authConfig);
      setNewTicket({ title: '', description: '', priority: 'Low' });
      fetchTickets();
      fetchNotifications();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create ticket.');
    }
  };

  // Drag and Drop Handler
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;

    // Optimistic UI Update
    setTickets(prev =>
      prev.map(ticket =>
        ticket._id === draggableId ? { ...ticket, status: newStatus } : ticket
      )
    );

    try {
      await axios.put(`${API_URL}/${draggableId}`, { status: newStatus }, authConfig);
      fetchTickets();
      fetchNotifications();
    } catch (err) {
      console.error('Failed to update status', err);
      fetchTickets();
    }
  };

  // Manual Status Change Handler
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await axios.put(`${API_URL}/${id}`, { status: newStatus }, authConfig);
      fetchTickets();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Ticket
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this issue?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`, authConfig);
      fetchTickets();
      if (selectedTicket?._id === id) {
        setSelectedTicket(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedTicket) return;

    try {
      const res = await axios.post(`${API_URL}/${selectedTicket._id}/comments`, { text: newComment }, authConfig);
      setSelectedTicket(res.data);
      setNewComment('');
      fetchTickets();
      fetchNotifications();
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to post comment.');
    }
  };

  // Update Profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/auth/profile', profileData, authConfig);
      alert('Profile updated successfully!');
      setShowProfileModal(false);
      setProfileData({ ...profileData, password: '' });
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    }
  };

  // Filter tickets based on search query
  const filteredTickets = tickets.filter(ticket =>
    ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Metrics
  const resolvedCount = tickets.filter(t => t.status === 'Resolved').length;
  const inProgressCount = tickets.filter(t => t.status === 'In Progress').length;
  const openCount = tickets.filter(t => t.status === 'Open').length;

  const chartData = [
    { name: 'Open', value: openCount },
    { name: 'In Progress', value: inProgressCount },
    { name: 'Resolved', value: resolvedCount },
  ];

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const activeProject = projects.find(p => p._id === selectedProjectId);

  const CHART_COLORS = ['#f59e0b', '#22d3ee', '#22c55e'];

  const columns = [
    { title: 'Open', status: 'Open', code: 'SEC.01', badge: 'bg-amber-500', colorText: 'text-amber-500' },
    { title: 'In Progress', status: 'In Progress', code: 'SEC.02', badge: 'bg-cyan-400', colorText: 'text-cyan-400' },
    { title: 'Resolved', status: 'Resolved', code: 'SEC.03', badge: 'bg-emerald-500', colorText: 'text-emerald-500' }
  ];

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'High':
        return 'bg-red-500/15 text-red-500 border-red-500/30';
      case 'Medium':
        return 'bg-amber-500/15 text-amber-500 border-amber-500/30';
      default:
        return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30';
    }
  };

  const renderTicketCard = (ticket, provided) => (
    <div
      key={ticket._id}
      ref={provided?.innerRef}
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
      style={{ ...provided?.draggableProps.style }}
      className="group p-4 sm:p-5 rounded-2xl theme-glass theme-border border hover:border-[#4ade80]/60 hover:shadow-[0_8px_25px_rgba(74,222,128,0.12)] relative flex flex-col mb-3 shrink-0 transition-all duration-200 h-auto cursor-grab active:cursor-grabbing select-none"
    >
      {/* Top Banner (Priority Tag & Date) */}
      <div className="flex justify-between items-center mb-2.5 gap-2">
        <div className="flex items-center gap-1.5 truncate">
          <span className={`px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider border flex items-center gap-1 shrink-0 ${getPriorityBadge(ticket.priority)}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {ticket.priority}
          </span>
          <span className="text-[10px] font-mono theme-muted opacity-70 truncate">
            #{ticket._id.substring(ticket._id.length - 4).toUpperCase()}
          </span>
        </div>
        <span className="text-[10px] font-mono theme-muted shrink-0">
          {ticket.createdAt ? format(new Date(ticket.createdAt), 'MMM d') : ''}
        </span>
      </div>

      {/* Ticket Title */}
      <h3 className={`text-sm sm:text-base font-syne font-bold mb-1.5 break-words leading-snug ${ticket.status === 'Resolved' ? 'theme-muted line-through opacity-70' : 'theme-text'}`}>
        {ticket.title}
      </h3>

      {/* Description */}
      <p className={`text-xs theme-muted mb-3 leading-relaxed font-sans line-clamp-2 ${ticket.status === 'Resolved' ? 'opacity-50' : ''}`}>
        {ticket.description}
      </p>

      {/* History & Discussion Meta */}
      <div className="theme-panel p-2.5 sm:p-3 rounded-xl border theme-border mb-3 space-y-1 mt-auto text-xs font-mono">
        <div className="flex justify-between items-center text-[10px] sm:text-[11px]">
          <span className="theme-muted">Opened by:</span>
          <span className="font-bold theme-text truncate ml-1">{ticket.user?.username || 'Dev'}</span>
        </div>

        {ticket.status === 'Resolved' && ticket.closedBy && (
          <div className="flex justify-between items-center text-[10px] sm:text-[11px] pt-1 border-t theme-border text-emerald-500">
            <span>Closed by:</span>
            <span className="font-bold truncate ml-1">{ticket.closedBy?.username}</span>
          </div>
        )}

        <button
          onClick={() => {
            setSelectedTicket(ticket);
            setModalTab('comments');
          }}
          className="w-full mt-1.5 py-1 text-[11px] font-bold text-[#facc15] hover:text-white bg-[#0d382b]/60 hover:bg-[#0d382b] border border-[#22c55e]/30 rounded-lg transition-colors flex items-center justify-center gap-1"
        >
          <span>💬 Thread ({ticket.comments?.length || 0})</span>
          <span>→</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-1 pt-2.5 border-t theme-border text-[11px] font-mono">
        <div className="flex items-center gap-1 flex-wrap">
          {ticket.status !== 'Open' && (
            <button
              onClick={() => handleUpdateStatus(ticket._id, 'Open')}
              className="px-2 py-1 rounded-lg theme-panel hover:bg-amber-500/20 hover:text-amber-400 theme-muted transition-colors border theme-border text-[10px] font-bold"
              title="Move to Open"
            >
              ← Open
            </button>
          )}
          {ticket.status === 'Open' && (
            <button
              onClick={() => handleUpdateStatus(ticket._id, 'In Progress')}
              className="px-2 py-1 rounded-lg theme-panel hover:bg-cyan-500/20 hover:text-cyan-400 theme-muted transition-colors border theme-border text-[10px] font-bold"
              title="Move to In Progress"
            >
              ⚡ Prog →
            </button>
          )}
          {ticket.status === 'In Progress' && (
            <button
              onClick={() => handleUpdateStatus(ticket._id, 'Resolved')}
              className="px-2 py-1 rounded-lg theme-panel hover:bg-emerald-500/20 hover:text-emerald-400 theme-muted transition-colors border theme-border text-[10px] font-bold"
              title="Resolve Ticket"
            >
              ✓ Resolve
            </button>
          )}
        </div>

        <button
          onClick={() => handleDelete(ticket._id)}
          className="p-1 rounded-lg theme-panel hover:bg-red-500/20 hover:text-red-400 theme-muted transition-colors border theme-border ml-auto text-xs"
          title="Delete Ticket"
        >
          ✕
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen theme-bg font-grotesk theme-text flex flex-col lg:flex-row relative overflow-x-hidden transition-colors duration-500">
      
      {/* Background Subtle Poster Grid & Ambient Glows */}
      <div className="absolute inset-0 poster-grid-bg opacity-30 pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'var(--ambient-glow-1)', filter: 'blur(140px)' }} />
      <div className="absolute bottom-[10%] right-[-10%] w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: 'var(--ambient-glow-2)', filter: 'blur(120px)' }} />

      {/* Sidebar Component */}
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
        setSelectedProjectId={(id) => {
          setSelectedProjectId(id);
          if (window.innerWidth < 1024) setIsSidebarOpen(false);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-3 sm:p-5 md:p-8 h-[100dvh] overflow-y-auto relative z-10 custom-scrollbar">
        <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-8">

          {/* Top Header Bar */}
          <header className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 theme-border shadow-xl flex flex-col gap-4">
            
            <div className="flex items-center justify-between gap-3 flex-wrap">
              
              {/* Left: Sidebar Toggle + Title */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 sm:p-2.5 rounded-xl theme-panel theme-border border shadow-sm hover:border-[#4ade80] hover:text-[#4ade80] transition-all shrink-0"
                  title="Toggle Workspace Sidebar"
                  aria-label="Toggle Sidebar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                <div>
                  <div className="flex items-center gap-1.5 font-mono text-[9px] sm:text-[10px] uppercase tracking-wider theme-muted">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                    <span>SYS.PORTAL // ACTIVE</span>
                  </div>
                  <h1 className="text-xl sm:text-3xl font-syne font-black tracking-tight theme-text leading-none mt-0.5">
                    SyncIssue <span className="text-[#facc15] font-mono text-xs font-bold">v2.4</span>
                  </h1>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 sm:gap-3 ml-auto">
                
                {/* Back to Landing Page Link */}
                <Link
                  to="/"
                  className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] font-mono font-bold theme-panel border theme-border rounded-xl hover:border-[#4ade80] transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <span>🌿</span>
                  <span className="hidden sm:inline">Landing Manifesto</span>
                </Link>

                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className="p-2 sm:p-2.5 theme-panel theme-border border rounded-xl theme-muted hover:text-[#facc15] transition-colors shrink-0"
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {theme === 'dark' ? '☀️' : '🌙'}
                </button>

                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 sm:p-2.5 theme-panel theme-border border rounded-xl theme-muted hover:text-[#4ade80] transition-colors relative shrink-0"
                    title="Notifications"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-[#facc15] text-[#08241b] rounded-full text-[9px] sm:text-[10px] font-mono font-black flex items-center justify-center border-2 border-[var(--bg-app)]">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Responsive Notifications Dropdown */}
                  {showNotifications && (
                    <div className="fixed inset-x-3 sm:inset-x-auto sm:right-0 top-16 mt-2 sm:w-80 theme-panel backdrop-blur-2xl rounded-2xl shadow-2xl border-2 theme-border overflow-hidden z-50 animate-[scaleIn_0.2s_ease-out]">
                      <div className="p-3.5 border-b theme-border flex justify-between items-center bg-[#0d382b]/30">
                        <h4 className="font-syne font-bold text-xs sm:text-sm theme-text">Notifications</h4>
                        {unreadCount > 0 && (
                          <span className="bg-[#facc15] text-[#08241b] text-[9px] font-mono font-bold px-2 py-0.5 rounded">
                            {unreadCount} New
                          </span>
                        )}
                      </div>
                      <div className="max-h-64 sm:max-h-72 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center theme-muted text-xs font-mono">
                            All caught up! Zero unread notifications. 🌿
                          </div>
                        ) : (
                          notifications.map(note => (
                            <div
                              key={note._id}
                              onClick={() => handleMarkNotificationRead(note._id, note.relatedTicket?._id)}
                              className={`p-3 border-b theme-border cursor-pointer transition-colors ${
                                !note.isRead ? 'bg-[#22c55e]/10 font-bold' : 'opacity-70 hover:opacity-100'
                              }`}
                            >
                              <p className="text-xs font-sans leading-relaxed theme-text">{note.message}</p>
                              <p className="text-[9px] font-mono theme-muted mt-1 opacity-70">
                                {format(new Date(note.createdAt), 'MMM d, h:mm a')}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* Sub-header: Quick Project Selector on Mobile + Metric Summary */}
            <div className="pt-2 border-t theme-border flex flex-wrap items-center justify-between gap-2.5">
              
              {/* Project Scope Pill */}
              <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar py-0.5 max-w-full">
                <span className="text-[10px] font-mono theme-muted uppercase shrink-0 font-bold">PROJECT:</span>
                {projects.map(p => (
                  <button
                    key={p._id}
                    onClick={() => setSelectedProjectId(p._id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-syne font-bold transition-all shrink-0 ${
                      selectedProjectId === p._id
                        ? 'bg-[#22c55e] text-[#08241b] shadow-sm'
                        : 'theme-panel theme-border border theme-muted hover:text-white'
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              {/* Stats pills */}
              <div className="flex items-center gap-2 font-mono text-[11px] ml-auto">
                <span className="px-2 py-0.5 theme-panel rounded-lg border theme-border">
                  <span className="text-amber-500 font-bold">{openCount}</span> Open
                </span>
                <span className="px-2 py-0.5 theme-panel rounded-lg border theme-border">
                  <span className="text-cyan-400 font-bold">{inProgressCount}</span> Prog
                </span>
                <span className="px-2 py-0.5 theme-panel rounded-lg border theme-border">
                  <span className="text-emerald-500 font-bold">{resolvedCount}</span> Done
                </span>
              </div>

            </div>

          </header>

          {/* No Team State */}
          {!decodedToken?.user?.teamId ? (
            <div className="glass-panel p-8 sm:p-12 rounded-2xl sm:rounded-3xl border-2 theme-border text-center shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-[#facc15] text-[#08241b] font-syne font-black text-2xl flex items-center justify-center mx-auto mb-3">
                ⚡
              </div>
              <h2 className="text-2xl sm:text-3xl font-syne font-black theme-text mb-2">Workspace Portal</h2>
              <p className="theme-muted font-sans text-xs sm:text-sm max-w-md mx-auto leading-relaxed mb-5">
                Join a team workspace using your 6-character code or create a new engineering team.
              </p>
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="px-5 py-2.5 bg-[#facc15] text-[#08241b] font-syne font-extrabold rounded-xl shadow-md text-xs sm:text-sm"
              >
                Open Team Setup Sidebar →
              </button>
            </div>
          ) : (
            <>
              {/* System Health / Analytics Card */}
              {tickets.length > 0 && (
                <div className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 theme-border shadow-lg flex flex-col lg:flex-row items-center gap-6">
                  
                  <div className="w-full lg:w-3/5 space-y-3">
                    <div className="flex items-center gap-2 font-mono text-[10px] sm:text-xs text-[#22c55e] font-bold uppercase">
                      <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                      <span>SPRINT VELOCITY // REAL-TIME</span>
                    </div>

                    <h2 className="text-lg sm:text-2xl font-syne font-extrabold theme-text leading-tight truncate">
                      {activeProject?.name || 'Selected Project Scope'}
                    </h2>

                    <div className="w-full theme-input rounded-full h-3 relative overflow-hidden border theme-border shadow-inner">
                      <div
                        className="bg-gradient-to-r from-[#22c55e] to-[#4ade80] h-full rounded-full transition-all duration-700"
                        style={{ width: `${(resolvedCount / (tickets.length || 1)) * 100}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono theme-muted">
                      <span>{openCount + inProgressCount} ACTIVE ISSUES</span>
                      <span className="text-emerald-500 font-bold">
                        {Math.round((resolvedCount / (tickets.length || 1)) * 100)}% RESOLVED
                      </span>
                    </div>
                  </div>

                  {/* Donut Chart */}
                  <div className="w-full lg:w-2/5 h-40 sm:h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={62}
                          paddingAngle={4}
                          dataKey="value"
                          stroke="none"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0d382b',
                            border: '1px solid #4ade80',
                            borderRadius: '10px',
                            color: '#f4f7f0',
                            fontFamily: 'JetBrains Mono',
                            fontSize: '11px'
                          }}
                        />
                        <Legend verticalAlign="bottom" height={28} wrapperStyle={{ fontSize: '10px', fontFamily: 'Space Grotesk' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                </div>
              )}

              {/* Create Issue Bar & Search */}
              <div className="space-y-3">
                
                {/* Search Bar */}
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Search issues by keyword, title, description..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 theme-input rounded-xl border theme-border text-xs font-medium focus:ring-2 focus:ring-[#22c55e] focus:outline-none transition-all"
                  />
                  <span className="absolute left-3 top-3 text-xs opacity-50">🔍</span>
                </div>

                {/* Form */}
                <form
                  onSubmit={handleSubmit}
                  className="glass-panel p-4 sm:p-5 rounded-2xl border-2 theme-border shadow-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end"
                >
                  <div className="sm:col-span-2 lg:col-span-4">
                    <label className="block text-[10px] font-mono font-bold theme-muted uppercase tracking-wider mb-1">
                      Issue Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Broken Safari header..."
                      required
                      className="w-full p-2.5 theme-input rounded-xl border theme-border text-xs font-medium focus:ring-2 focus:ring-[#22c55e] focus:outline-none"
                      value={newTicket.title}
                      onChange={e => setNewTicket({ ...newTicket, title: e.target.value })}
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-5">
                    <label className="block text-[10px] font-mono font-bold theme-muted uppercase tracking-wider mb-1">
                      Context / Details
                    </label>
                    <input
                      type="text"
                      placeholder="Reproduction steps or stack trace..."
                      required
                      className="w-full p-2.5 theme-input rounded-xl border theme-border text-xs font-medium focus:ring-2 focus:ring-[#22c55e] focus:outline-none"
                      value={newTicket.description}
                      onChange={e => setNewTicket({ ...newTicket, description: e.target.value })}
                    />
                  </div>

                  <div className="sm:col-span-1 lg:col-span-2">
                    <label className="block text-[10px] font-mono font-bold theme-muted uppercase tracking-wider mb-1">
                      Priority
                    </label>
                    <select
                      className="w-full p-2.5 theme-input rounded-xl border theme-border text-xs font-mono font-bold focus:ring-2 focus:ring-[#22c55e] focus:outline-none"
                      value={newTicket.priority}
                      onChange={e => setNewTicket({ ...newTicket, priority: e.target.value })}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>

                  <div className="sm:col-span-1 lg:col-span-1">
                    <button
                      type="submit"
                      className="w-full bg-[#facc15] hover:bg-[#eab308] text-[#08241b] font-syne font-extrabold text-xs py-2.5 rounded-xl shadow-md transition-all text-center whitespace-nowrap"
                    >
                      + Add
                    </button>
                  </div>
                </form>

              </div>

              {/* Mobile Column Quick Filter Pills (Shown only on small screens) */}
              <div className="flex md:hidden items-center gap-1.5 overflow-x-auto custom-scrollbar py-1">
                <span className="text-[10px] font-mono theme-muted uppercase font-bold shrink-0">VIEW:</span>
                {['All', 'Open', 'In Progress', 'Resolved'].map(colName => (
                  <button
                    key={colName}
                    onClick={() => setMobileActiveColumn(colName)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all shrink-0 ${
                      mobileActiveColumn === colName
                        ? 'bg-[#0d382b] text-[#facc15] border border-[#22c55e]'
                        : 'theme-panel theme-border border theme-muted'
                    }`}
                  >
                    {colName}
                  </button>
                ))}
              </div>

              {/* Kanban Drag & Drop Columns */}
              <div className="flex flex-row gap-4 overflow-x-auto pb-6 custom-scrollbar items-start min-h-[460px] snap-x snap-mandatory scroll-smooth">
                <DragDropContext onDragEnd={onDragEnd}>
                  {columns
                    .filter(col => mobileActiveColumn === 'All' || mobileActiveColumn === col.status)
                    .map(col => {
                      const colTickets = filteredTickets.filter(t => t.status === col.status);

                      return (
                        <Droppable key={col.status} droppableId={col.status}>
                          {(provided, snapshot) => (
                            <div
                              className={`w-[86vw] xs:w-[82vw] sm:w-[320px] md:w-[330px] lg:flex-1 shrink-0 snap-center rounded-2xl sm:rounded-3xl border-2 theme-border theme-panel p-3.5 sm:p-4 flex flex-col shadow-lg min-h-[440px] transition-colors ${
                                snapshot.isDraggingOver ? 'bg-[#22c55e]/15 border-[#22c55e]' : ''
                              }`}
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                            >
                              {/* Column Header */}
                              <div className="flex justify-between items-center mb-3 px-1 pt-1 shrink-0">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2.5 h-2.5 rounded-full ${col.badge}`} />
                                  <h2 className="font-syne font-bold text-xs sm:text-sm tracking-wide theme-text uppercase">
                                    {col.title}
                                  </h2>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] font-mono">
                                  <span className="theme-bg theme-border border px-2 py-0.5 rounded-full font-bold">
                                    {colTickets.length}
                                  </span>
                                </div>
                              </div>

                              {/* Cards List */}
                              <div className="flex-1 overflow-y-auto custom-scrollbar pr-0.5 flex flex-col gap-2.5 min-h-0 pb-2">
                                {colTickets.length === 0 && !snapshot.isDraggingOver ? (
                                  <div className="flex-1 border-2 border-dashed theme-border rounded-2xl flex flex-col items-center justify-center min-h-[120px] opacity-40 text-xs font-mono">
                                    <span>[ EMPTY ]</span>
                                    <span className="text-[10px] mt-1">Drag tickets here</span>
                                  </div>
                                ) : (
                                  colTickets.map((ticket, index) => (
                                    <Draggable key={ticket._id} draggableId={ticket._id} index={index}>
                                      {dragProvided => renderTicketCard(ticket, dragProvided)}
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
                </DragDropContext>
              </div>

            </>
          )}

          {/* Ticket Details & Discussion Modal */}
          {selectedTicket && (
            <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 animate-[scaleIn_0.2s_ease-out]">
              <div className="theme-panel w-full rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl h-[94vh] sm:h-[88vh] flex flex-col overflow-hidden border-2 theme-border">
                
                {/* Modal Top Header */}
                <div className="p-3.5 sm:p-5 border-b theme-border flex justify-between items-center theme-bg shrink-0 gap-3">
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="px-2 py-0.5 bg-[#facc15] text-[#08241b] font-mono font-black text-[10px] sm:text-xs rounded shrink-0">
                      #{selectedTicket._id.substring(selectedTicket._id.length - 4).toUpperCase()}
                    </span>
                    <h3 className="text-sm sm:text-lg font-syne font-bold theme-text truncate">
                      {selectedTicket.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="shrink-0 theme-muted hover:text-red-500 p-1.5 sm:p-2 rounded-xl border theme-border theme-panel"
                  >
                    ✕
                  </button>
                </div>

                {/* Mobile Tab Switcher for Modal */}
                <div className="flex md:hidden border-b theme-border theme-bg text-xs font-mono font-bold">
                  <button
                    onClick={() => setModalTab('details')}
                    className={`flex-1 py-2.5 text-center transition-colors ${
                      modalTab === 'details'
                        ? 'text-[#facc15] border-b-2 border-[#facc15] bg-[#0d382b]/30'
                        : 'theme-muted'
                    }`}
                  >
                    📋 Details & Audit
                  </button>
                  <button
                    onClick={() => setModalTab('comments')}
                    className={`flex-1 py-2.5 text-center transition-colors ${
                      modalTab === 'comments'
                        ? 'text-[#facc15] border-b-2 border-[#facc15] bg-[#0d382b]/30'
                        : 'theme-muted'
                    }`}
                  >
                    💬 Chat ({selectedTicket.comments?.length || 0})
                  </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-0">
                  
                  {/* Left Column: Metadata & History */}
                  <div className={`w-full md:w-[38%] border-b md:border-b-0 md:border-r theme-border theme-bg p-4 sm:p-6 overflow-y-auto custom-scrollbar space-y-4 ${modalTab === 'details' ? 'flex flex-col' : 'hidden md:flex md:flex-col'}`}>
                    <div>
                      <h4 className="text-[10px] sm:text-xs font-mono font-bold theme-muted uppercase tracking-wider mb-1.5">
                        Description
                      </h4>
                      <p className="theme-text text-xs sm:text-sm font-sans leading-relaxed theme-panel p-3 sm:p-4 rounded-xl border theme-border">
                        {selectedTicket.description}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-[10px] sm:text-xs font-mono font-bold theme-muted uppercase tracking-wider mb-2">
                        Activity Timeline
                      </h4>
                      <div className="pl-3 border-l-2 theme-border space-y-3 text-[11px] font-mono">
                        <div>
                          <div className="text-[9px] theme-muted opacity-70">
                            {selectedTicket.createdAt ? format(new Date(selectedTicket.createdAt), 'MMM d, h:mm a') : ''}
                          </div>
                          <div className="theme-text font-medium">
                            Opened by <strong className="text-[#4ade80]">@{selectedTicket.user?.username || 'user'}</strong>
                          </div>
                        </div>

                        {selectedTicket.status === 'Resolved' && (
                          <div className="pt-2 border-t theme-border text-emerald-500">
                            <div className="text-[9px] opacity-70">
                              {selectedTicket.closedAt ? format(new Date(selectedTicket.closedAt), 'MMM d, h:mm a') : ''}
                            </div>
                            <div className="font-bold">
                              ✓ Resolved by @{selectedTicket.closedBy?.username || 'admin'}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Comments Thread */}
                  <div className={`w-full md:w-[62%] flex flex-col bg-transparent overflow-hidden flex-1 ${modalTab === 'comments' ? 'flex' : 'hidden md:flex'}`}>
                    
                    {/* Comments Message Area */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-3 flex flex-col">
                      {!selectedTicket.comments || selectedTicket.comments.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center theme-muted text-xs font-mono m-auto text-center opacity-60">
                          <span className="text-2xl mb-1">💬</span>
                          <p>No discussion yet.</p>
                          <p className="text-[10px]">Start the thread below.</p>
                        </div>
                      ) : (
                        selectedTicket.comments.map((comment, idx) => {
                          const isMe = comment.user?._id === decodedToken?.user?.id;
                          return (
                            <div
                              key={idx}
                              className={`flex flex-col max-w-[90%] sm:max-w-[85%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
                            >
                              <span className="text-[9px] sm:text-[10px] font-mono theme-muted mb-1 px-1">
                                {isMe ? 'You' : `@${comment.user?.username}`} • {format(new Date(comment.createdAt), 'h:mm a')}
                              </span>
                              <div
                                className={`px-3.5 py-2 rounded-2xl text-xs font-sans leading-relaxed ${
                                  isMe
                                    ? 'bg-[#22c55e] text-[#08241b] font-medium rounded-tr-sm'
                                    : 'theme-panel border theme-border theme-text rounded-tl-sm'
                                }`}
                              >
                                {comment.text}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Chat Input */}
                    <div className="p-3 sm:p-4 border-t theme-border theme-bg shrink-0">
                      <form onSubmit={handleAddComment} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Type reply..."
                          className="flex-1 theme-input border theme-border rounded-xl px-3.5 py-2 text-xs font-medium focus:ring-2 focus:ring-[#22c55e] focus:outline-none"
                          value={newComment}
                          onChange={e => setNewComment(e.target.value)}
                        />
                        <button
                          type="submit"
                          disabled={!newComment.trim()}
                          className="bg-[#facc15] hover:bg-[#eab308] disabled:opacity-50 text-[#08241b] font-syne font-bold rounded-xl px-4 py-2 text-xs transition-all shrink-0"
                        >
                          Send ↗
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
            <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-3 animate-[scaleIn_0.2s_ease-out]">
              <div className="theme-panel rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border-2 theme-border">
                <div className="p-4 sm:p-5 theme-border border-b flex justify-between items-center theme-bg">
                  <h3 className="text-base sm:text-lg font-syne font-bold theme-text flex items-center gap-2">
                    <span>👤</span>
                    <span>Profile Settings</span>
                  </h3>
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="theme-muted hover:text-red-500 p-1.5 rounded-xl border theme-border theme-panel"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleUpdateProfile} className="p-5 sm:p-6 space-y-3.5">
                  <div>
                    <label className="block text-[10px] font-mono font-bold theme-muted uppercase tracking-wider mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      className="w-full p-2.5 theme-input rounded-xl border theme-border text-xs font-medium focus:ring-2 focus:ring-[#22c55e] focus:outline-none"
                      value={profileData.username}
                      onChange={e => setProfileData({ ...profileData, username: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono font-bold theme-muted uppercase tracking-wider mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Leave blank to keep current"
                      className="w-full p-2.5 theme-input rounded-xl border theme-border text-xs font-medium focus:ring-2 focus:ring-[#22c55e] focus:outline-none"
                      value={profileData.password}
                      onChange={e => setProfileData({ ...profileData, password: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#facc15] text-[#08241b] font-syne font-black text-xs sm:text-sm py-2.5 sm:py-3 rounded-xl shadow-md hover:scale-105 transition-transform"
                  >
                    Save Changes
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Footer */}
          <footer className="pt-6 pb-2 text-center font-mono text-[10px] sm:text-xs theme-muted opacity-70 border-t theme-border flex flex-wrap items-center justify-between gap-2">
            <span>SYNCISSUE WORKSPACE ENGINE // 2026</span>
            <span>NATURE-TECH PROTOCOL</span>
          </footer>

        </div>
      </main>

    </div>
  );
}

export default Dashboard;