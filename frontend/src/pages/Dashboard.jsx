import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns'; // We'll install date-fns next
import { jwtDecode } from 'jwt-decode';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Sidebar from '../components/Sidebar';

const API_URL = '/api/tickets';

function Dashboard({ token, handleLogout }) {
  const [tickets, setTickets] = useState([]);
  const [newTicket, setNewTicket] = useState({ title: '', description: '', priority: 'Low' });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Extract User info from Token
  const decodedToken = jwtDecode(token);

  // Setup Axios Auth Header
  const authConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  // Fetch tickets on mount
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await axios.get(API_URL, authConfig);
      setTickets(res.data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  // Submit new ticket
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, newTicket, authConfig);
      setNewTicket({ title: '', description: '', priority: 'Low' });
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

  const COLORS = ['#ef4444', '#22c55e']; // Red for active, Green for resolved

  // Kanban Columns Data Structure
  const columns = [
    { title: 'Open', status: 'Open', color: 'blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
    { title: 'In Progress', status: 'In Progress', color: 'amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
    { title: 'Resolved', status: 'Resolved', color: 'emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' }
  ];

  const renderTicketCard = (ticket) => (
    <div key={ticket._id} className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:shadow-slate-500/5 hover:-translate-y-1 transition-all duration-300 relative flex flex-col h-full mb-4">

      {/* Top Banner (Priority & Date) */}
      <div className="flex justify-between items-start mb-3">
        <span className={`shrink-0 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 ${ticket.priority === 'High' ? 'bg-red-50 text-red-700 border border-red-100' :
          ticket.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
            'bg-blue-50 text-blue-700 border border-blue-100'
          }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${ticket.priority === 'High' ? 'bg-red-500' : ticket.priority === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'}`}></span>
          {ticket.priority}
        </span>
        <span className="text-[10px] font-bold text-slate-400">
          {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : ''}
        </span>
      </div>

      <h3 className={`text-lg font-bold mb-2 ${ticket.status === 'Resolved' ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-800'}`}>
        {ticket.title}
      </h3>

      <p className={`text-sm text-slate-600 mb-6 leading-relaxed font-medium flex-1 ${ticket.status === 'Resolved' ? 'opacity-60' : ''}`}>
        {ticket.description}
      </p>

      {/* Ticket History Metadata */}
      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400 font-medium">Opened by:</span>
          <span className="font-bold text-slate-700">{ticket.user?.username || 'Unknown'}</span>
        </div>

        {ticket.status === 'Resolved' && ticket.closedBy && (
          <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200/60 mt-2">
            <span className="text-emerald-500 font-medium">Closed by:</span>
            <span className="font-bold text-emerald-700">{ticket.closedBy?.username}</span>
          </div>
        )}

        <button
          onClick={() => setSelectedTicket(ticket)}
          className="w-full mt-2 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors flex items-center justify-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          View Full History
        </button>
      </div>

      {/* Kanban Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-auto pt-4 border-t border-slate-100">
        <div className="flex gap-1.5">
          {ticket.status !== 'Open' && (
            <button onClick={() => handleUpdateStatus(ticket._id, 'Open')} className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors" title="Move to Open">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            </button>
          )}
          {ticket.status === 'Open' && (
            <button onClick={() => handleUpdateStatus(ticket._id, 'In Progress')} className="text-slate-500 hover:text-amber-600 hover:bg-amber-50 p-1.5 rounded-lg transition-colors" title="Move to In Progress">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </button>
          )}
          {ticket.status === 'In Progress' && (
            <button onClick={() => handleUpdateStatus(ticket._id, 'Resolved')} className="text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 p-1.5 rounded-lg transition-colors" title="Resolve Issue">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
            </button>
          )}
        </div>

        <button onClick={() => handleDelete(ticket._id)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors ml-auto" title="Delete Ticket">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col md:flex-row">
      <Sidebar
        token={token}
        handleLogout={handleLogout}
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <main className="flex-1 p-4 md:p-8 h-screen overflow-y-auto">
        <div className="w-full max-w-6xl mx-auto">

          {/* Header Section */}
          <header className="mb-10 flex flex-col md:flex-row justify-between items-center bg-white p-6 md:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <div className="w-full md:w-auto flex justify-between items-center mb-6 md:mb-0">
              <div>
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-2 md:mb-3">
                  <span className="text-blue-600">Nexus</span> Tracker
                </h1>
                <p className="text-slate-500 font-medium text-sm md:text-lg tracking-wide">Professional Bug & Issue Management</p>
              </div>

              {/* Mobile Sidebar Toggle Button */}
              <button
                className="md:hidden p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                onClick={() => setIsSidebarOpen(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
            </div>
            {decodedToken?.user?.teamId && (
              <div className="mt-6 md:mt-0 flex items-center gap-4">
                <div className="bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 shadow-sm">
                  <span className="block text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Total Issues</span>
                  <span className="text-3xl font-black text-slate-800">{tickets.length}</span>
                </div>
                <div className="bg-emerald-50 px-6 py-4 rounded-2xl border border-emerald-100 shadow-sm hidden sm:block">
                  <span className="block text-xs text-emerald-600 uppercase font-bold tracking-wider mb-1">Resolved</span>
                  <span className="text-3xl font-black text-emerald-700">{resolvedCount}</span>
                </div>
              </div>
            )}
          </header>

          {/* State: No Team */}
          {!decodedToken?.user?.teamId ? (
            <div className="bg-white p-16 rounded-[2rem] border border-slate-200 shadow-sm text-center">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🏢</span>
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-4">Welcome to Nexus Tracker</h2>
              <p className="text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
                To get started, please create a new workspace or join an existing one using the options in the sidebar.
              </p>
            </div>
          ) : (
            <>

              {/* --- Dashboard / Charts Section --- */}
              {tickets.length > 0 && (
                <div className="mb-10 bg-white border border-slate-100 p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col md:flex-row items-center gap-10">
                  <div className="w-full md:w-1/2">
                    <h2 className="text-2xl font-bold mb-4 text-slate-800 flex items-center gap-3">
                      <span className="bg-blue-600 w-2 h-8 rounded-full"></span> System Health
                    </h2>
                    <p className="text-slate-600 leading-relaxed mb-6 text-lg">
                      Track your bug resolution rate in real-time. Currently, you have <strong className="text-slate-900">{openCount}</strong> active issues out of <strong className="text-slate-900">{tickets.length}</strong> total reported bugs.
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-3 relative overflow-hidden shadow-inner">
                      <div
                        className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${(resolvedCount / (tickets.length || 1)) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-right text-sm mt-3 text-slate-500 font-bold">
                      {Math.round((resolvedCount / (tickets.length || 1)) * 100)}% Resolved
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
                          contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '12px', color: '#1e293b', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                        />
                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#64748b', fontWeight: '600' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Report New Ticket Bar */}
              <div className="mb-8">
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col md:flex-row gap-4 items-end">
                  <div className="w-full md:w-1/3">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Issue Title</label>
                    <input type="text" placeholder="e.g. Broken links..." required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-sm" value={newTicket.title} onChange={e => setNewTicket({ ...newTicket, title: e.target.value })} />
                  </div>
                  <div className="w-full md:w-1/3">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Context</label>
                    <input type="text" placeholder="Short description..." required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-sm" value={newTicket.description} onChange={e => setNewTicket({ ...newTicket, description: e.target.value })} />
                  </div>
                  <div className="w-full md:w-1/6">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Priority</label>
                    <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-sm" value={newTicket.priority} onChange={e => setNewTicket({ ...newTicket, priority: e.target.value })}>
                      <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full md:w-auto bg-blue-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-500 hover:-translate-y-0.5 transition-all text-sm h-[46px]">
                    + Add
                  </button>
                </form>
              </div>

              {/* Trello Board Grid */}
              <div className="flex flex-col xl:flex-row gap-6 overflow-x-auto pb-6 custom-scrollbar items-start min-h-[500px]">

                {columns.map(col => {
                  const colTickets = filteredTickets.filter(t => t.status === col.status);

                  return (
                    <div key={col.status} className={`flex-1 min-w-[320px] rounded-[2rem] border ${col.border} ${col.bg} p-4 flex flex-col shadow-inner`}>
                      {/* Column Header */}
                      <div className="flex justify-between items-center mb-6 px-2 pt-2">
                        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full bg-${col.color}`}></span>
                          {col.title}
                        </h2>
                        <span className="bg-white text-slate-500 shadow-sm border border-slate-200 text-xs px-2.5 py-1 rounded-full font-bold">
                          {colTickets.length}
                        </span>
                      </div>

                      {/* Column Cards Container */}
                      <div className="flex-1 flex flex-col gap-3">
                        {colTickets.length === 0 ? (
                          <div className="flex-1 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center min-h-[150px] opacity-50">
                            <span className="text-slate-400 font-bold text-sm">Drop here</span>
                          </div>
                        ) : (
                          colTickets.map(ticket => renderTicketCard(ticket))
                        )}
                      </div>
                    </div>
                  );
                })}

              </div>
            </>
          )}

          {/* Footer */}
          <footer className="mt-16 text-center text-slate-400 text-sm font-medium pb-8">
            <p className="flex items-center justify-center gap-2">
              Built with <span className="text-red-500 text-lg">❤️</span> by <a href="https://github.com/MahmoudEsawi" target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-600 font-bold hover:underline transition-colors">Mahmoud Esawi</a>
            </p>
          </footer>

          {/* Ticket History Modal */}
          {selectedTicket && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-[scale-in_0.2s_ease-out]">

                {/* Modal Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                    <span className="bg-blue-600 p-2 rounded-xl text-white shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </span>
                    Ticket History
                  </h3>
                  <button onClick={() => setSelectedTicket(null)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                {/* Modal Content - Timeline */}
                <div className="p-8">
                  <div className="mb-8">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Issue</h4>
                    <p className="text-lg font-bold text-slate-800">{selectedTicket.title}</p>
                  </div>

                  <div className="relative pl-6 border-l-2 border-slate-200 space-y-8">
                    {/* Creation Event */}
                    <div className="relative">
                      <div className="absolute -left-[35px] bg-white p-1 rounded-full border-2 border-slate-200">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      </div>
                      <p className="text-xs font-bold text-slate-500 mb-1">
                        {selectedTicket.createdAt ? format(new Date(selectedTicket.createdAt), 'MMM d, yyyy - h:mm a') : 'Unknown Date'}
                      </p>
                      <p className="text-sm font-medium text-slate-800 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        Ticket opened by <strong className="text-blue-600">{selectedTicket.user?.username || 'Unknown'}</strong>.
                        <br /><span className="text-slate-500 text-xs mt-1 block">Status set to Open.</span>
                      </p>
                    </div>

                    {/* Closing Event */}
                    {selectedTicket.status === 'Resolved' ? (
                      <div className="relative">
                        <div className="absolute -left-[35px] bg-white p-1 rounded-full border-2 border-emerald-200">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]"></div>
                        </div>
                        <p className="text-xs font-bold text-emerald-600 mb-1">
                          {selectedTicket.closedAt ? format(new Date(selectedTicket.closedAt), 'MMM d, yyyy - h:mm a') : 'Unknown Date'}
                        </p>
                        <p className="text-sm font-medium text-slate-800 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                          Issue resolved by <strong className="text-emerald-600">{selectedTicket.closedBy?.username || 'Unknown'}</strong>.
                        </p>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="absolute -left-[35px] bg-white p-1 rounded-full border-2 border-slate-200">
                          <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                        </div>
                        <p className="text-sm font-bold text-slate-400 italic">Work in progress...</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                  <button onClick={() => setSelectedTicket(null)} className="text-sm font-bold text-slate-600 hover:text-slate-800 px-6 py-2">Close</button>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default Dashboard;