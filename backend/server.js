const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const path = require('path');
const Ticket = require('./models/Ticket');

const app = express();
app.use(cors());
app.use(express.json());

// الشبك مع قاعدة البيانات
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🔥 MongoDB Connected Successfully'))
    .catch(err => console.log('❌ MongoDB Connection Error: ', err));

// API لجلب كل التذاكر
app.get('/api/tickets', async (req, res) => {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.json(tickets);
});

// API لإضافة تذكرة جديدة
app.post('/api/tickets', async (req, res) => {
    const newTicket = new Ticket(req.body);
    await newTicket.save();
    res.status(201).json(newTicket);
});

// API لتحديث حالة التذكرة
app.put('/api/tickets/:id', async (req, res) => {
    try {
        const updatedTicket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        res.json(updatedTicket);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update ticket' });
    }
});

// API لحذف تذكرة
app.delete('/api/tickets/:id', async (req, res) => {
    try {
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

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(_dirname, 'frontend', 'dist', 'index.html'));
    });
}
// ------------------------------------------

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));