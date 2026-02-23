<div align="center">

# ⚡ SyncIssue

A sleek, intuitive, and lightning-fast **Professional Issue & Project Management Platform** engineered to streamline development workflows, designed with a stunning dark-glass aesthetic.

[![Live Demo - Frontend](https://img.shields.io/badge/Live_Demo-Frontend_App-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://full-stack-bug-tracker.vercel.app)
[![Live Demo - Backend API](https://img.shields.io/badge/Live_API-Backend_Server-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://full-stack-bug-tracker.onrender.com/api/tickets)

<br/>

_No more lost bug reports. No more disjointed workflows. Just pure, organized issue synchronization._

</div>

---

## 🔥 Core Features

- 🏢 **Team Organizations & Roles:** Create a workspace and invite members via secure 6-character codes. Admins can manage the team roster and kick members dynamically.
- 🗂️ **Project Management:** Keep tickets siloed by project scopes. Seamlessly switch between projects to filter your Kanban view instantly.
- 📋 **Trello-style Drag & Drop Kanban:** Interactive, drag-and-drop pipelines (Open, In Progress, Resolved) powered by `@hello-pangea/dnd` for fluid motion across desktop and mobile.
- 💬 **Live Ticket Discussions:** Embedded comment threads attached to every ticket, allowing rapid debugging and continuous context-sharing.
- 🔔 **Drop-Down Notification System:** Live notification bell that alerts users to new comments, ticket status changes, and mentions instantly.
- 📜 **Full Accountability History:** Immutable ticket history tracking exactly _who_ opened a ticket, and who pushed the final "Resolve" button with exact timestamps.
- 🎨 **Neon Dark Glassmorphism:** A breathtaking UI built with Tailwind CSS, featuring deep obsidian panels, fuchsia/indigo gradients, and translucent glass blurs. Includes a buttery smooth Light/Dark mode toggle.
- 📱 **Flawless Mobile Experience:** Custom CSS snap-scrolling Kanban grids, responsive floating overlays, and off-canvas team sidebars crafted specifically for touch devices.
- 🔒 **Secure Authorization:** Robust JWT-based Login, Registration, and User Profile Management protected by bcrypt hashing and Role-Based Access Controls (Admin vs Member).

---

## 🚦 Application User Flow

1. **Authentication Gate**: Any new visitor arrives at the Login/Registration screen.
2. **Team Onboarding**: New users must either Create a Team (becoming Admin) or Join a Team via an invite code.
3. **Workspace Initialization**: Admins can immediately create distinct "Projects" under their Team umbrella.
4. **The Dashboard**: Users view their synced Kanban board, completely localized to their active Team and selected Project.
5. **Issue Triage**: Create bugs, physically drag them across columns to update their global state, or drop into the Ticket Modal to chat with the team.
6. **Resolution**: Closing a ticket permanently archives the closer's Identity and Timestamp.

---

## 💻 Tech Stack Galaxy

The application is built on the battle-tested **MERN** stack, supercharged with modern UI/UX principles.

| **Layer** | **Technology** | **Why?** |
| :--- | :--- | :--- |
| **Frontend** | ![React](https://img.shields.io/badge/-React.js-000000?style=flat&logo=react) <br> ![Vite](https://img.shields.io/badge/-Vite-000000?style=flat&logo=vite) | Blazing fast HMR. Uses `@hello-pangea/dnd` for fluid motion, `recharts` for data, and `date-fns` for time formatting. |
| **Styling** | ![TailwindCSS](https://img.shields.io/badge/-Tailwind_CSS-000000?style=flat&logo=tailwindcss) | Utility-first architecture allowing incredibly complex radial gradients and backdrop blurs directly in JSX. |
| **Backend** | ![Node.js](https://img.shields.io/badge/-Node.js-000000?style=flat&logo=nodedotjs) <br> ![Express.js](https://img.shields.io/badge/-Express.js-000000?style=flat&logo=express) | Non-blocking, event-driven RESTful architecture perfect for standard JSON CRUD. |
| **Database** | ![MongoDB](https://img.shields.io/badge/-MongoDB-000000?style=flat&logo=mongodb) <br> ![Mongoose](https://img.shields.io/badge/-Mongoose-000000?style=flat&logo=mongoose) | Deep relational embedding (Users -> Teams -> Projects -> Tickets -> Comments) via flexible NoSQL references. |
| **Security** | ![JWT](https://img.shields.io/badge/-JSON_Web_Tokens-000000?style=flat&logo=jsonwebtokens) <br> ![Bcrypt](https://img.shields.io/badge/-Bcrypt.js-000000?style=flat&logo=npm) | Robust stateless authentication payloads carrying Role/Team contexts. |

---

## 🚀 Quick Start Guide

Spin up your own instance locally in less than 2 minutes.

### 1. Clone & Conquer
```bash
git clone https://github.com/MahmoudEsawi/Full-stack-Bug-Tracker.git
cd Full-stack-Bug-Tracker
```

### 2. Ignite the Backend
Open a terminal and ignite the server:
```bash
cd backend
npm install
```
Create a `.env` file right inside the `backend` folder:
```env
MONGO_URI=your_mongodb_cluster_string
PORT=5001
JWT_SECRET=your_jwt_signature_key
```
Start the engine:
```bash
npm run dev
```

### 3. Launch the Frontend
In a fresh terminal window:
```bash
cd frontend
npm install
npm run dev
```
> The magic happens at `http://localhost:5173`. Happy Squashin'! 🦋🐞

---

<div align="center">
  <p>Engineered with ☕ and passion by <b>Mahmoud Esawi</b>.</p>
</div>
