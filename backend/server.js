const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const path = require('path');
const Ticket = require('./models/Ticket');

const authRoutes = require('./routes/authRoute');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
app.use(cors());
app.use(express.json());

// الشبك مع قاعدة البيانات
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🔥 MongoDB Connected Successfully'))
    .catch(err => console.log('❌ MongoDB Connection Error: ', err));

// Auth Routes
app.use('/api/auth', authRoutes);

// API لجلب كل التذاكر الخاصة بالفريق
app.get('/api/tickets', authMiddleware, async (req, res) => {
    try {
        const tickets = await Ticket.find({ team: req.user.teamId })
            .populate('user', 'username')
            .populate('closedBy', 'username')
            .sort({ createdAt: -1 });
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
});

// API لإضافة تذكرة جديدة
app.post('/api/tickets', authMiddleware, async (req, res) => {
    try {
        const newTicket = new Ticket({
            ...req.body,
            user: req.user.id, // Attach the logged in user's ID
            team: req.user.teamId // Attach the shared team ID
        });
        await newTicket.save();
        res.status(201).json(newTicket);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create ticket' });
    }
});

// API لتحديث حالة التذكرة
app.put('/api/tickets/:id', authMiddleware, async (req, res) => {
    try {
        // Ensure the ticket belongs to the user's team
        let ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        if (ticket.team.toString() !== req.user.teamId) {
            return res.status(401).json({ message: 'User not authorized to update this ticket' });
        }

        // Build the update object dynamically based on the target status
        const updateData = {};
        if (req.body.status) {
            updateData.status = req.body.status;

            if (req.body.status === 'Resolved' || req.body.status === 'Closed') {
                updateData.closedBy = req.user.id;
                updateData.closedAt = Date.now();
            } else {
                // If reopened, clear the closing metadata
                updateData.closedBy = null;
                updateData.closedAt = null;
            }
        }

        ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        )
            .populate('user', 'username')
            .populate('closedBy', 'username');

        res.json(ticket);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update ticket' });
    }
});

// API لحذف تذكرة
app.delete('/api/tickets/:id', authMiddleware, async (req, res) => {
    try {
        // Ensure the ticket belongs to the user's team
        let ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        if (ticket.team.toString() !== req.user.teamId) {
            return res.status(401).json({ message: 'User not authorized to delete this ticket' });
        }

        await Ticket.findByIdAndDelete(req.params.id);
        res.json({ message: 'Ticket deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete ticket' });
    }
});

// --- Serve React Frontend in Production ---
const _dirname = path.resolve();
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(_dirname, '/frontend/dist')));

    app.use((req, res) => {
        res.sendFile(path.resolve(_dirname, 'frontend', 'dist', 'index.html'));
    });
}
// ------------------------------------------

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));// Trigger nodemon restart
