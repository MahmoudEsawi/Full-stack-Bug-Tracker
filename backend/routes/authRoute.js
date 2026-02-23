const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Team = require('../models/Team');
const crypto = require('crypto');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if user already exists
        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = new User({ username, password });

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Create JWT Payload
        const payload = {
            user: {
                id: user.id,
                username: user.username,
                teamCode: user.teamCode
            }
        };

        // Sign the token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' }, // Token valid for 7 days
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, username: user.username, teamId: user.team, role: user.role } });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/auth/login
// @desc    Login user & get token
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if user exists
        let user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Verify Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        // Create JWT Payload
        const payload = {
            user: {
                id: user.id,
                username: user.username,
                teamId: user.team,
                role: user.role
            }
        };

        // Sign the token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, username: user.username, teamId: user.team, role: user.role } });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/auth/team/create
// @desc    Create a new team and become Admin
router.post('/team/create', authMiddleware, async (req, res) => {
    const { teamName } = req.body;

    try {
        if (!teamName || teamName.trim() === '') {
            return res.status(400).json({ message: 'Team Name is required' });
        }

        // Generate a 6-character random alphanumeric code
        const code = crypto.randomBytes(3).toString('hex').toUpperCase();

        const newTeam = new Team({
            name: teamName,
            code,
            admin: req.user.id
        });

        await newTeam.save();

        // Update User
        let user = await User.findById(req.user.id);
        user.team = newTeam._id;
        user.role = 'Admin';
        await user.save();

        const payload = {
            user: {
                id: user.id,
                username: user.username,
                teamId: user.team,
                role: user.role
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, team: newTeam });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/auth/team/join
// @desc    Join an existing team as Member using its unique code
router.post('/team/join', authMiddleware, async (req, res) => {
    const { teamCode } = req.body;

    try {
        if (!teamCode) {
            return res.status(400).json({ message: 'Team Code is required' });
        }

        // Find Team by code
        const team = await Team.findOne({ code: teamCode.toUpperCase().trim() });
        if (!team) {
            return res.status(404).json({ message: 'Invalid Team Code' });
        }

        // Update User
        let user = await User.findById(req.user.id);
        user.team = team._id;
        user.role = 'Member';
        await user.save();

        const payload = {
            user: {
                id: user.id,
                username: user.username,
                teamId: user.team,
                role: user.role
            }
        };

        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, team });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
