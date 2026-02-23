import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [tickets, setTickets] = useState([]);
  const [newTicket, setNewTicket] = useState({ title: '', description: '', priority: 'Low' });

  // جلب الداتا من السيرفر أول ما تفتح الشاشة
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await axios.get('/api/tickets');
      setTickets(res.data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  // إرسال تذكرة جديدة (Bug) للقاعدة
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/tickets', newTicket);
      setNewTicket({ title: '', description: '', priority: 'Low' }); // تفريغ الخانات
      fetchTickets(); // تحديث الشاشة عشان تطلع التذكرة الجديدة
    } catch (error) {
      console.error("Error adding ticket:", error);
    }
  };

  // تحديث حالة التذكرة لـ Resolved
  const handleUpdate = async (id) => {
    try {
      await axios.put(`/api/tickets/${id}`, { status: 'Resolved' });
      fetchTickets();
    } catch (error) {
      console.error("Error updating ticket:", error);
    }
  };

  // حذف التذكرة
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/tickets/${id}`);
      fetchTickets();
    } catch (error) {
      console.error("Error deleting ticket:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-8 text-blue-700 tracking-tight">
          🐞 Bug Tracker System
        </h1>

        {/* فورم إضافة تذكرة */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Report a New Bug</h2>
          <div className="flex flex-col gap-4">
            <input
              type="text" placeholder="Bug Title (e.g., Login button not working)" required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newTicket.title} onChange={e => setNewTicket({ ...newTicket, title: e.target.value })}
            />
            <textarea
              placeholder="Describe the issue in detail..." required rows="3"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newTicket.description} onChange={e => setNewTicket({ ...newTicket, description: e.target.value })}
            />
            <div className="flex items-center gap-4">
              <label className="font-semibold text-gray-700">Priority:</label>
              <select
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newTicket.priority} onChange={e => setNewTicket({ ...newTicket, priority: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              <button type="submit" className="ml-auto bg-blue-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200">
                Submit Ticket
              </button>
            </div>
          </div>
        </form>

        {/* عرض التذاكر */}
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Active Tickets ({tickets.length})</h2>
        <div className="grid gap-5">
          {tickets.length === 0 ? (
            <p className="text-gray-500 italic">No bugs reported yet. You're all good!</p>
          ) : (
            tickets.map(ticket => (
              <div key={ticket._id} className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-blue-500 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{ticket.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${ticket.priority === 'High' ? 'bg-red-100 text-red-700' :
                    ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                    {ticket.priority} Priority
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{ticket.description}</p>
                <div className="flex gap-3 text-sm font-semibold mt-4">
                  <span className={`px-3 py-1 rounded-lg border ${ticket.status === 'Resolved' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'
                    }`}>
                    Status: {ticket.status}
                  </span>

                  {ticket.status !== 'Resolved' && (
                    <button
                      onClick={() => handleUpdate(ticket._id)}
                      className="bg-green-500 text-white px-4 py-1 rounded-lg hover:bg-green-600 transition"
                    >
                      ✓ Mark as Done
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(ticket._id)}
                    className="ml-auto bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-600 transition"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;