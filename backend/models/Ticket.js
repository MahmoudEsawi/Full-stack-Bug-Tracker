const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['Open', 'In Progress', 'Resolved'], default: 'Open' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);