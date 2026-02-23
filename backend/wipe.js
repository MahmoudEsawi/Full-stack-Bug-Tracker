const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Ticket = require('./models/Ticket');
const Team = require('./models/Team');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('MongoDB Connected. Wiping Database for fresh Team Schemas...');
        await User.deleteMany({});
        await Ticket.deleteMany({});
        await Team.deleteMany({});
        console.log('Database wiped successfully!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Error wiping database:', err);
        process.exit(1);
    });
