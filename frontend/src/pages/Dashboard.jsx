import { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const API_URL = '/api/tickets';

function Dashboard({ token, handleLogout }) {
  const [tickets, setTickets] = useState([]);
  const [newTicket, setNewTicket] = useState({ title: '', description: '', priority: 'Low' });
  const [searchQuery, setSearchQuery] = useState('');

  // Extract User info from Token
  const decodedToken = jwtDecode(token);
  const teamCode = decodedToken?.user?.teamCode || "PERSONAL";

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

  // Update ticket to Resolved
  const handleUpdate = async (id) => {
    try {
      await axios.put(`${API_URL}/${id}`, { status: 'Resolved' }, authConfig);
      fetchTickets();
    } catch (error) {
      console.error("Error updating ticket:", error);
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

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800 flex justify-center">
      <div className="w-full max-w-6xl">

        {/* Header Section */}
        <header className="mb-10 text-center md:text-left flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">
              <span className="text-blue-600">Nexus</span> Tracker
            </h1>
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <p className="text-slate-500 font-medium text-lg tracking-wide">Professional Bug & Issue Management</p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100 max-w-fit mt-2 md:mt-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
                Team: {teamCode}
              </span>
            </div>
          </div>
          <div className="mt-6 md:mt-0 flex items-center gap-4">
            <div className="bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 shadow-sm">
              <span className="block text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Total Issues</span>
              <span className="text-3xl font-black text-slate-800">{tickets.length}</span>
            </div>
            <div className="bg-emerald-50 px-6 py-4 rounded-2xl border border-emerald-100 shadow-sm hidden sm:block">
              <span className="block text-xs text-emerald-600 uppercase font-bold tracking-wider mb-1">Resolved</span>
              <span className="text-3xl font-black text-emerald-700">{resolvedCount}</span>
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-200 px-5 py-3 rounded-2xl font-bold transition-all shadow-sm flex items-center gap-2"
            >
              Logout
            </button>
          </div>
        </header>

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
              <div className="w-full bg-slate-100 rounded-full h-3 relative overflow-hidden">
                <div
                  className="bg-emerald-500 h-3 rounded-full transition-all duration-1000"
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form */}
          <div className="lg:col-span-1">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 sticky top-8">
              <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-3">
                <span className="bg-blue-600 w-2 h-6 rounded-full"></span> Report Issue
              </h2>

              <div className="flex flex-col gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2 ml-1">Issue Title</label>
                  <input
                    type="text" placeholder="e.g., API returning 500" required
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 placeholder-slate-400 transition-all font-medium"
                    value={newTicket.title} onChange={e => setNewTicket({ ...newTicket, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2 ml-1">Detailed Description</label>
                  <textarea
                    placeholder="Steps to reproduce..." required rows="4"
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 placeholder-slate-400 transition-all resize-none font-medium"
                    value={newTicket.description} onChange={e => setNewTicket({ ...newTicket, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2 ml-1">Severity / Priority</label>
                  <select
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 appearance-none cursor-pointer transition-all font-bold"
                    value={newTicket.priority} onChange={e => setNewTicket({ ...newTicket, priority: e.target.value })}
                  >
                    <option value="Low">🟢 Low Priority</option>
                    <option value="Medium">🟡 Medium Priority</option>
                    <option value="High">🔴 High Priority</option>
                  </select>
                </div>

                <button type="submit" className="mt-2 w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-md shadow-blue-600/20 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200">
                  Create Ticket
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Tickets List */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Search Bar */}
            <div className="bg-white border border-slate-200 p-2 rounded-2xl flex items-center gap-3 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
              <span className="pl-4 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search tickets by title or content..."
                className="w-full bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none py-3 pr-4 font-medium"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Tickets Grid */}
            <div className="flex flex-col gap-5">
              {filteredTickets.length === 0 ? (
                <div className="text-center p-16 bg-white border border-slate-200 rounded-[2rem] border-dashed">
                  <p className="text-slate-500 text-lg font-medium">No tickets found. You are all caught up! ✨</p>
                </div>
              ) : (
                filteredTickets.map(ticket => (
                  <div key={ticket._id} className="group bg-white p-7 rounded-[2rem] shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-200 transition-all duration-300 relative overflow-hidden flex flex-col h-full">

                    {/* Status Indicator */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors ${ticket.status === 'Resolved' ? 'bg-emerald-500' :
                      ticket.priority === 'High' ? 'bg-red-500' :
                        ticket.priority === 'Medium' ? 'bg-amber-500' : 'bg-blue-400'
                      }`}></div>

                    <div className="flex justify-between items-start mb-4">
                      <h3 className={`text-xl font-bold pr-4 ${ticket.status === 'Resolved' ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-800'}`}>
                        {ticket.title}
                      </h3>
                      <span className={`shrink-0 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide inline-flex items-center gap-1.5 ${ticket.priority === 'High' ? 'bg-red-50 text-red-700 border border-red-100' :
                        ticket.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          'bg-blue-50 text-blue-700 border border-blue-100'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${ticket.priority === 'High' ? 'bg-red-500' : ticket.priority === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'}`}></span>
                        {ticket.priority}
                      </span>
                    </div>

                    <p className={`text-slate-600 mb-8 leading-relaxed font-medium ${ticket.status === 'Resolved' ? 'opacity-60' : ''}`}>
                      {ticket.description}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3 mt-auto pt-5 border-t border-slate-100">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest ${ticket.status === 'Resolved' ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' : 'text-slate-500 bg-slate-50 border border-slate-200'
                        }`}>
                        {ticket.status}
                      </span>

                      <div className="flex gap-2">
                        {ticket.status !== 'Resolved' && (
                          <button
                            onClick={() => handleUpdate(ticket._id)}
                            className="text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200"
                          >
                            Mark Done
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(ticket._id)}
                          className="text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-slate-400 text-sm font-medium pb-8">
          <p className="flex items-center justify-center gap-2">
            Built with <span className="text-red-500 text-lg">❤️</span> by <a href="https://github.com/MahmoudEsawi" target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-600 font-bold hover:underline transition-colors">Mahmoud Esawi</a>
          </p>
        </footer>

      </div>
    </div>
  );
}

export default Dashboard;