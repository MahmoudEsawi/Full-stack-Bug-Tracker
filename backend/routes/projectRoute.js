const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const authMiddleware = require('../middleware/authMiddleware');

// Get all projects for a team
router.get('/', authMiddleware, async (req, res) => {
    try {
        if (!req.user.teamId) {
            return res.status(403).json({ message: 'User does not belong to a team.' });
        }

        const projects = await Project.find({ team: req.user.teamId })
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 });

        res.json(projects);
    } catch (err) {
        console.error('Error fetching projects:', err.message);
        res.status(500).send('Server Error');
    }
});

// Create a new project
router.post('/', authMiddleware, async (req, res) => {
    try {
        if (!req.user.teamId) {
            return res.status(403).json({ message: 'User does not belong to a team.' });
        }

        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Project name is required' });
        }

        const newProject = new Project({
            name,
            description,
            team: req.user.teamId,
            createdBy: req.user.id
        });

        const project = await newProject.save();
        res.status(201).json(project);
    } catch (err) {
        console.error('Error creating project:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
