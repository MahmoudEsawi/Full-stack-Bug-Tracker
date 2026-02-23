import { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const API_URL = 'https://full-stack-bug-tracker.onrender.com/api/tickets';

function App() {
  const [tickets, setTickets] = useState([]);
  const [newTicket, setNewTicket] = useState({ title: '', description: '', priority: 'Low' });
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch tickets on mount
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await axios.get(API_URL);
      setTickets(res.data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  // Submit new ticket
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, newTicket);
      setNewTicket({ title: '', description: '', priority: 'Low' });
      fetchTickets();
    } catch (error) {
      console.error("Error adding ticket:", error);
    }
  };

  // Update ticket to Resolved
  const handleUpdate = async (id) => {
    try {
      await axios.put(`${API_URL}/${id}`, { status: 'Resolved' });
      fetchTickets();
    } catch (error) {
      console.error("Error updating ticket:", error);
    }
  };

  // Delete ticket
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-4 md:p-8 font-sans text-gray-100 flex justify-center">
      <div className="w-full max-w-5xl">

        {/* Header Section */}
        <header className="mb-10 text-center md:text-left flex flex-col md:flex-row justify-between items-center bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl shadow-2xl">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 tracking-tight mb-2">
              👾 Nexus Tracker
            </h1>
            <p className="text-gray-300 font-medium tracking-wide">Streamlined Bug & Issue Management</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-4">
            <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/10 shadow-inner backdrop-blur-sm">
              <span className="block text-xs text-gray-400 uppercase font-bold tracking-wider">Total</span>
              <span className="text-2xl font-black text-white">{tickets.length}</span>
            </div>
            <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/10 shadow-inner backdrop-blur-sm">
              <span className="block text-xs text-green-400 uppercase font-bold tracking-wider">Resolved</span>
              <span className="text-2xl font-black text-white">{resolvedCount}</span>
            </div>
          </div>
        </header>

        {/* --- Dashboard / Charts Section --- */}
        {tickets.length > 0 && (
          <div className="mb-10 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center gap-8 hover:bg-white/10 transition duration-500">
            <div className="w-full md:w-1/2">
              <h2 className="text-2xl font-extrabold mb-2 text-white flex items-center gap-2">
                <span className="bg-blue-500 w-2 h-8 rounded-full"></span> System Health
              </h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Track your bug resolution rate in real-time. Currently, you have <strong className="text-white">{openCount}</strong> active issues out of <strong className="text-white">{tickets.length}</strong> total reported bugs.
              </p>

              {/* Progress Bar Alternative for Mobile/Quick view */}
              <div className="w-full bg-gray-700/50 rounded-full h-4 relative overflow-hidden">
                <div
                  className="bg-green-500 h-4 rounded-full shadow-[0_0_10px_#22c55e] transition-all duration-1000"
                  style={{ width: `${(resolvedCount / tickets.length) * 100}%` }}
                ></div>
              </div>
              <p className="text-right text-xs mt-2 text-gray-400 font-bold">
                {Math.round((resolvedCount / tickets.length) * 100)}% Resolved
              </p>
            </div>

            <div className="w-full md:w-1/2 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form */}
          <div className="lg:col-span-1">
            <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/20 sticky top-8 hover:bg-white/20 transition duration-500">
              <h2 className="text-2xl font-extrabold mb-6 text-white flex items-center gap-2">
                <span className="bg-purple-500 w-2 h-8 rounded-full"></span> Report Issue
              </h2>

              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1 ml-1">Title</label>
                  <input
                    type="text" placeholder="e.g., API returning 500" required
                    className="w-full p-3 bg-black/30 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 transition"
                    value={newTicket.title} onChange={e => setNewTicket({ ...newTicket, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1 ml-1">Description</label>
                  <textarea
                    placeholder="Steps to reproduce..." required rows="4"
                    className="w-full p-3 bg-black/30 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 transition resize-none"
                    value={newTicket.description} onChange={e => setNewTicket({ ...newTicket, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1 ml-1">Severity / Priority</label>
                  <select
                    className="w-full p-3 bg-black/30 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white appearance-none cursor-pointer transition"
                    value={newTicket.priority} onChange={e => setNewTicket({ ...newTicket, priority: e.target.value })}
                  >
                    <option value="Low" className="bg-gray-900 text-white">🟢 Low</option>
                    <option value="Medium" className="bg-gray-900 text-white">🟡 Medium</option>
                    <option value="High" className="bg-gray-900 text-white">🔴 High</option>
                  </select>
                </div>

                <button type="submit" className="mt-2 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-95 transition-all duration-300">
                  + Create Ticket
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Tickets List */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Search Bar */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-2 rounded-2xl flex items-center gap-3">
              <span className="pl-4 text-2xl">🔍</span>
              <input
                type="text"
                placeholder="Search tickets by title or content..."
                className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none py-3 pr-4"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Tickets Grid */}
            <div className="flex flex-col gap-4">
              {filteredTickets.length === 0 ? (
                <div className="text-center p-12 bg-white/5 border border-white/10 rounded-3xl border-dashed">
                  <p className="text-gray-400 text-lg">No bugs found. Everything looks perfect! 🚀</p>
                </div>
              ) : (
                filteredTickets.map(ticket => (
                  <div key={ticket._id} className="group bg-white/10 backdrop-blur-lg p-6 rounded-3xl shadow-xl border border-white/10 hover:border-purple-400/50 hover:bg-white/20 transition-all duration-300 relative overflow-hidden">

                    {/* Status Glow Indicator */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${ticket.status === 'Resolved' ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' :
                      ticket.priority === 'High' ? 'bg-red-500' : 'bg-transparent'
                      }`}></div>

                    <div className="flex justify-between items-start mb-3">
                      <h3 className={`text-xl font-bold pr-4 ${ticket.status === 'Resolved' ? 'text-gray-400 line-through decoration-gray-500/50' : 'text-white'}`}>
                        {ticket.title}
                      </h3>
                      <span className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm ${ticket.priority === 'High' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                        ticket.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                          'bg-green-500/20 text-green-300 border border-green-500/30'
                        }`}>
                        {ticket.priority}
                      </span>
                    </div>

                    <p className={`text-sm mb-6 leading-relaxed ${ticket.status === 'Resolved' ? 'text-gray-500' : 'text-gray-300'}`}>
                      {ticket.description}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3 mt-auto pt-4 border-t border-white/10">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest ${ticket.status === 'Resolved' ? 'text-green-400 bg-green-400/10' : 'text-purple-300 bg-purple-400/10'
                        }`}>
                        {ticket.status}
                      </span>

                      <div className="flex gap-2">
                        {ticket.status !== 'Resolved' && (
                          <button
                            onClick={() => handleUpdate(ticket._id)}
                            className="bg-white/10 hover:bg-green-500/20 text-green-300 border border-transparent hover:border-green-500/50 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200"
                          >
                            Mark Done
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(ticket._id)}
                          className="bg-white/10 hover:bg-red-500/20 text-red-300 border border-transparent hover:border-red-500/50 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200"
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
        <footer className="mt-12 text-center text-gray-400 text-sm font-medium pb-8">
          <p className="flex items-center justify-center gap-2">
            Built with <span className="text-red-500 text-lg">❤️</span> by <a href="https://github.com/MahmoudEsawi" target="_blank" rel="noreferrer" className="text-purple-400 hover:text-pink-400 font-bold tracking-wide transition-colors">Mahmoud Esawi</a>
          </p>
        </footer>

      </div>
    </div>
  );
}

export default App;