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
    teamCode: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
