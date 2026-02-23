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
                teamId: user.team,
                role: user.role
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

// @route   GET /api/auth/team
// @desc    Get the user's current team details (including invite code if Admin)
router.get('/team', authMiddleware, async (req, res) => {
    try {
        let user = await User.findById(req.user.id);
        if (!user || !user.team) {
            return res.status(404).json({ message: 'No team found' });
        }

        const team = await Team.findById(user.team);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Fetch all members of this team
        const members = await User.find({ team: user.team }).select('username role _id');

        // Return team details. If user is Admin, they get to see the invite code.
        const teamData = {
            id: team._id,
            name: team.name,
            code: user.role === 'Admin' ? team.code : null, // Hide code from standard members if preferred
            admin: team.admin,
            members: members
        };

        res.json(teamData);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile (username, password)
router.put('/profile', authMiddleware, async (req, res) => {
    const { username, password } = req.body;
    try {
        let user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (username) user.username = username;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();

        res.json({ message: 'Profile updated successfully', user: { id: user.id, username: user.username, role: user.role } });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/auth/team/kick/:userId
// @desc    Admin kicks a member from the team
router.delete('/team/kick/:userId', authMiddleware, async (req, res) => {
    try {
        // 1. Verify the requester is an Admin
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Only team admins can remove members.' });
        }

        const teamId = req.user.teamId;
        const userIdToKick = req.params.userId;

        // 2. Prevent admin from kicking themselves
        if (userIdToKick === req.user.id) {
            return res.status(400).json({ message: 'You cannot kick yourself.' });
        }

        // 3. Find the user to kick
        const userToKick = await User.findById(userIdToKick);
        if (!userToKick) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // 4. Verify the user is actually in this team
        if (String(userToKick.team) !== String(teamId)) {
            return res.status(400).json({ message: 'User is not in your team.' });
        }

        // 5. Remove team association from user
        userToKick.team = null;
        userToKick.role = 'Member'; // Reset role just in case
        await userToKick.save();

        // 6. Remove user from Team members array
        await Team.findByIdAndUpdate(teamId, {
            $pull: { members: userIdToKick }
        });

        // Optional: Remove tickets assigned to this user from the team?
        // Let's leave their tickets as unassigned or keep them assigned depending on business logic.

        res.json({ message: 'User successfully removed from the team.', kickedUserId: userIdToKick });

    } catch (err) {
        console.error('Error kicking user:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
