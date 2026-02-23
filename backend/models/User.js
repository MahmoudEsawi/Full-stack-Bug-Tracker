const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        default: null
    },
    role: {
        type: String,
        enum: ['Admin', 'Member'],
        default: 'Member'
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
