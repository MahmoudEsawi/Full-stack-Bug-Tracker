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
        res.status(500).json({ message: err.message || 'Server Error' });
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
        res.status(500).json({ message: err.message || 'Server Error' });
    }
});

// Delete a project
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        if (!req.user.teamId) {
            return res.status(403).json({ message: 'User does not belong to a team.' });
        }

        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Ensure user belongs to the project's team
        if (project.team.toString() !== req.user.teamId) {
            return res.status(401).json({ message: 'Not authorized to delete this project' });
        }

        // Option: Delete all tickets associated with this project first
        const Ticket = require('../models/Ticket');
        await Ticket.deleteMany({ project: project._id });

        // Delete the project
        await project.deleteOne();

        res.json({ message: 'Project and all associated tickets removed successfully' });
    } catch (err) {
        console.error('Error deleting project:', err.message);
        res.status(500).json({ message: err.message || 'Server Error' });
    }
});

module.exports = router;
