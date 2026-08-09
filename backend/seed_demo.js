const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const Team = require('./models/Team');
const Project = require('./models/Project');
const Ticket = require('./models/Ticket');
const Notification = require('./models/Notification');

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔥 Connected to MongoDB');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // 1. Admin User
        let admin = await User.findOne({ username: 'admin_demo' });
        if (!admin) {
            admin = new User({ username: 'admin_demo', password: hashedPassword, role: 'Admin' });
        } else {
            admin.password = hashedPassword;
            admin.role = 'Admin';
        }
        await admin.save();

        // 2. Team
        let team = await Team.findOne({ code: 'ALPHA1' });
        if (!team) {
            team = new Team({
                name: 'Alpha Engineering',
                code: 'ALPHA1',
                admin: admin._id
            });
            await team.save();
        }

        admin.team = team._id;
        await admin.save();

        // 3. Member: sarah_dev
        let sarah = await User.findOne({ username: 'sarah_dev' });
        if (!sarah) {
            sarah = new User({ username: 'sarah_dev', password: hashedPassword, role: 'Member', team: team._id });
        } else {
            sarah.password = hashedPassword;
            sarah.team = team._id;
            sarah.role = 'Member';
        }
        await sarah.save();

        // 4. Member: alex_qa
        let alex = await User.findOne({ username: 'alex_qa' });
        if (!alex) {
            alex = new User({ username: 'alex_qa', password: hashedPassword, role: 'Member', team: team._id });
        } else {
            alex.password = hashedPassword;
            alex.team = team._id;
            alex.role = 'Member';
        }
        await alex.save();

        // 5. New Dev User: new_dev_user
        let newDev = await User.findOne({ username: 'new_dev_user' });
        if (!newDev) {
            newDev = new User({ username: 'new_dev_user', password: hashedPassword, role: 'Member', team: team._id });
        } else {
            newDev.password = hashedPassword;
            newDev.team = team._id;
            newDev.role = 'Member';
        }
        await newDev.save();

        // 6. Also alias dev_user for convenience
        let devUser = await User.findOne({ username: 'dev_user' });
        if (!devUser) {
            devUser = new User({ username: 'dev_user', password: hashedPassword, role: 'Member', team: team._id });
        } else {
            devUser.password = hashedPassword;
            devUser.team = team._id;
            devUser.role = 'Member';
        }
        await devUser.save();

        // 7. Projects
        let proj1 = await Project.findOne({ name: 'Core Web Platform', team: team._id });
        if (!proj1) {
            proj1 = new Project({
                name: 'Core Web Platform',
                description: 'Frontend client, UI design system, Kanban drag & drop, and client state.',
                team: team._id,
                createdBy: admin._id
            });
            await proj1.save();
        }

        let proj2 = await Project.findOne({ name: 'Mobile & API Engine', team: team._id });
        if (!proj2) {
            proj2 = new Project({
                name: 'Mobile & API Engine',
                description: 'REST API, authentication microservices, JWT sessions, and push notifications.',
                team: team._id,
                createdBy: admin._id
            });
            await proj2.save();
        }

        let proj3 = await Project.findOne({ name: 'Design System & UI', team: team._id });
        if (!proj3) {
            proj3 = new Project({
                name: 'Design System & UI',
                description: 'Nature-tech editorial styling, Tailwind v4 tokens, Syne & Space Grotesk fonts.',
                team: team._id,
                createdBy: admin._id
            });
            await proj3.save();
        }

        // 8. Clean old tickets & notifications
        await Ticket.deleteMany({ team: team._id });
        await Notification.deleteMany({ recipient: { $in: [admin._id, sarah._id, alex._id, newDev._id, devUser._id] } });

        // 9. Seed Rich Realistic Tickets across Project 1 (Core Web Platform)
        const t1 = new Ticket({
            title: 'Safari backdrop-filter blur artifact on sticky glass header',
            description: 'On iOS 18 Safari, scrolling past the top banner causes a 1px artifact line under the glassmorphic navigation bar. Needs -webkit-backdrop-filter hardware acceleration fix.',
            priority: 'High',
            status: 'Open',
            user: newDev._id,
            team: team._id,
            project: proj1._id,
            comments: [
                { user: alex._id, text: 'Reproduced on iPhone 15 Pro (iOS 18.2). Applying transform: translateZ(0) fixes the rendering jitter.' },
                { user: newDev._id, text: 'Testing the transform fix across Safari and Chrome now.' }
            ]
        });
        await t1.save();

        const t2 = new Ticket({
            title: 'Keyboard shortcuts for rapid issue triage (J/K navigation)',
            description: 'Implement Vim-style J/K keyboard navigation to let power users jump between cards and press E to edit or R to resolve.',
            priority: 'Low',
            status: 'Open',
            user: sarah._id,
            team: team._id,
            project: proj1._id,
            comments: [
                { user: admin._id, text: 'Great idea! Make sure shortcuts are disabled when typing inside input or textarea elements.' }
            ]
        });
        await t2.save();

        const t3 = new Ticket({
            title: 'Refactor Kanban drag physics for touch screens',
            description: 'Optimize @hello-pangea/dnd drag handles for mobile snap-scrolling grids to prevent scroll-drag collision.',
            priority: 'High',
            status: 'In Progress',
            user: admin._id,
            team: team._id,
            project: proj1._id,
            comments: [
                { user: sarah._id, text: 'Added auto-scroll lock during active drag gestures. 60fps achieved on test devices.' },
                { user: newDev._id, text: 'Looks ultra-smooth! Tested on both portrait and landscape mobile viewports.' }
            ]
        });
        await t3.save();

        const t4 = new Ticket({
            title: 'Add CSV & JSON issue export functionality',
            description: 'Allow team leads to export sprint reports in CSV/JSON format with full ticket history and timestamps.',
            priority: 'Medium',
            status: 'In Progress',
            user: newDev._id,
            team: team._id,
            project: proj1._id,
            comments: [
                { user: admin._id, text: 'Let’s include closedBy username and resolved timestamps in the CSV export columns.' }
            ]
        });
        await t4.save();

        const t5 = new Ticket({
            title: 'Light/Dark mode theme flickering on initial hydration',
            description: 'Fix flash of unstyled theme on page refresh by reading localStorage theme token prior to DOM paint.',
            priority: 'Medium',
            status: 'Resolved',
            user: newDev._id,
            team: team._id,
            project: proj1._id,
            closedBy: newDev._id,
            closedAt: new Date(Date.now() - 1000 * 60 * 45), // 45 mins ago
            comments: [
                { user: newDev._id, text: 'Implemented inline script in index.html to initialize theme class immediately.' },
                { user: alex._id, text: 'Verified! Zero flicker on cold refresh.' }
            ]
        });
        await t5.save();

        const t6 = new Ticket({
            title: 'Add audit logging and closer timestamps for resolved issues',
            description: 'Persist closer user ID and cryptographic server timestamps into the ticket document upon status change.',
            priority: 'High',
            status: 'Resolved',
            user: alex._id,
            team: team._id,
            project: proj1._id,
            closedBy: admin._id,
            closedAt: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
            comments: [
                { user: admin._id, text: 'Schema updated and validated with unit tests. Population working flawlessly.' }
            ]
        });
        await t6.save();

        // 10. Seed Project 2 (Mobile & API Engine) Tickets
        const t7 = new Ticket({
            title: 'Optimize JWT refresh token verification latency',
            description: 'Reduce auth middleware overhead from 45ms to under 5ms via in-memory cryptographic secret caching.',
            priority: 'High',
            status: 'In Progress',
            user: sarah._id,
            team: team._id,
            project: proj2._id,
            comments: [
                { user: admin._id, text: 'Secret caching enabled. Average auth middleware latency is now 1.8ms.' }
            ]
        });
        await t7.save();

        const t8 = new Ticket({
            title: 'Rate-limiting middleware for auth endpoints',
            description: 'Protect /api/auth/login and /api/auth/register against brute-force attacks with IP bucket rate-limiting.',
            priority: 'High',
            status: 'Open',
            user: newDev._id,
            team: team._id,
            project: proj2._id,
            comments: [
                { user: newDev._id, text: 'Drafting express-rate-limit configuration with 10 requests per minute limit.' }
            ]
        });
        await t8.save();

        const t9 = new Ticket({
            title: 'Bcrypt salt rounds upgrade & token revocation',
            description: 'Standardize bcrypt salt rounds to 10 and ensure password reset invalidates all previous sessions.',
            priority: 'Medium',
            status: 'Resolved',
            user: admin._id,
            team: team._id,
            project: proj2._id,
            closedBy: admin._id,
            closedAt: new Date(Date.now() - 1000 * 60 * 300),
            comments: [
                { user: alex._id, text: 'Security review passed.' }
            ]
        });
        await t9.save();

        // 11. Seed In-App Notifications for new_dev_user and dev_user
        const notificationsData = [
            {
                recipient: newDev._id,
                message: 'Sarah mentioned you in ticket: "Refactor Kanban drag physics for touch screens"',
                relatedTicket: t3._id,
                isRead: false,
                createdAt: new Date(Date.now() - 1000 * 60 * 15) // 15 mins ago
            },
            {
                recipient: newDev._id,
                message: 'Alex commented on your ticket: "Safari backdrop-filter blur artifact on sticky glass header"',
                relatedTicket: t1._id,
                isRead: false,
                createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 mins ago
            },
            {
                recipient: newDev._id,
                message: 'Admin resolved ticket: "Add audit logging and closer timestamps for resolved issues"',
                relatedTicket: t6._id,
                isRead: true,
                createdAt: new Date(Date.now() - 1000 * 60 * 120) // 2 hours ago
            },
            {
                recipient: devUser._id,
                message: 'Sarah mentioned you in ticket: "Refactor Kanban drag physics for touch screens"',
                relatedTicket: t3._id,
                isRead: false,
                createdAt: new Date(Date.now() - 1000 * 60 * 15)
            },
            {
                recipient: devUser._id,
                message: 'Alex commented on your ticket: "Safari backdrop-filter blur artifact on sticky glass header"',
                relatedTicket: t1._id,
                isRead: false,
                createdAt: new Date(Date.now() - 1000 * 60 * 30)
            }
        ];

        await Notification.insertMany(notificationsData);

        console.log('🎉 Dump data successfully created for new_dev_user and team!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding error:', err);
        process.exit(1);
    }
}

seed();
