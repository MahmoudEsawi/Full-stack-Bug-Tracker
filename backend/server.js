const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const path = require('path');
const Ticket = require('./models/Ticket');
const User = require('./models/User');
const Notification = require('./models/Notification');

const authRoutes = require('./routes/authRoute');
const notificationRoutes = require('./routes/notificationRoute');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
app.use(cors());
app.use(express.json());

// الشبك مع قاعدة البيانات
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🔥 MongoDB Connected Successfully'))
    .catch(err => console.log('❌ MongoDB Connection Error: ', err));

// Auth & Notification Routes
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);

// API لجلب كل التذاكر الخاصة بالفريق
app.get('/api/tickets', authMiddleware, async (req, res) => {
    try {
        const tickets = await Ticket.find({ team: req.user.teamId })
            .populate('user', 'username')
            .populate('closedBy', 'username')
            .populate('comments.user', 'username')
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

        // Notify other team members
        const teamMembers = await User.find({ team: req.user.teamId, _id: { $ne: req.user.id } });
        const notifications = teamMembers.map(member => ({
            recipient: member._id,
            message: `New ticket created: ${newTicket.title}`,
            relatedTicket: newTicket._id
        }));
        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

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

        const oldStatus = ticket.status;

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
            .populate('closedBy', 'username')
            .populate('comments.user', 'username');

        // Notify ticket creator if status changed and the updater isn't the creator
        if (oldStatus !== ticket.status && ticket.user._id.toString() !== req.user.id) {
            await Notification.create({
                recipient: ticket.user._id,
                message: `Ticket "${ticket.title}" status changed to ${ticket.status}`,
                relatedTicket: ticket._id
            });
        }

        res.json(ticket);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update ticket' });
    }
});

// API لإضافة تعليق إلى التذكرة
app.post('/api/tickets/:id/comments', authMiddleware, async (req, res) => {
    try {
        let ticket = await Ticket.findById(req.params.id);
        if (!ticket || ticket.team.toString() !== req.user.teamId) {
            return res.status(404).json({ message: 'Ticket not found or unauthorized' });
        }

        const newComment = {
            user: req.user.id,
            text: req.body.text
        };

        ticket.comments.push(newComment);
        await ticket.save();

        // Populate to return the full commenter details back to frontend
        ticket = await Ticket.findById(ticket._id)
            .populate('user', 'username')
            .populate('closedBy', 'username')
            .populate('comments.user', 'username');

        // Notify ticket creator and previous commenters (excluding the active user)
        const notifyUsers = new Set();
        if (ticket.user._id.toString() !== req.user.id) {
            notifyUsers.add(ticket.user._id.toString());
        }
        ticket.comments.forEach(c => {
            if (c.user._id.toString() !== req.user.id) {
                notifyUsers.add(c.user._id.toString());
            }
        });

        const notifications = Array.from(notifyUsers).map(userId => ({
            recipient: userId,
            message: `New comment on ticket "${ticket.title}"`,
            relatedTicket: ticket._id
        }));
        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
        }

        res.status(201).json(ticket);
    } catch (err) {
        res.status(500).json({ error: 'Failed to add comment' });
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
