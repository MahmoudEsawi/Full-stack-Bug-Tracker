<div align="center">

# 🐞 Full-Stack Bug Tracker 

A sleek, intuitive, and lightning-fast **Issue & Bug Tracking System** engineered to streamline your development workflow.

[![Live Demo - Frontend](https://img.shields.io/badge/Live_Demo-Frontend_App-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://full-stack-bug-tracker.vercel.app)
[![Live Demo - Backend API](https://img.shields.io/badge/Live_API-Backend_Server-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://full-stack-bug-tracker.onrender.com/api/tickets)

<br/>

_No more lost bug reports. No more emails. Just pure, organized issue management._

</div>

---

## 🔥 Features that actually matter

- 🏢 **Team Workspaces:** Create an organization, invite team members via secure 6-character codes, and collaborate dynamically across the team's shared issues dashboard.
- 📋 **Trello-style Kanban Board:** Intuitive, horizontal pipelines (Open, In Progress, Resolved) for instant visual tracking and fast status progression.
- 💬 **Live Ticket Discussions:** In-ticket comment threads allowing rapid debugging and context-sharing among teammates right where the problem lives.
- 🔔 **Real-Time Notifications:** Stay instantly aware of new bugs, status changes, and teammate comments via an elegant Dropdown Notification Bell.
- � **Full Accountability:** Immutable ticket history tracking exactly _who_ opened a ticket, and who pushed the final "Resolve" button with exact timestamps.
- 🔒 **Secure Authentication & Profiles:** Robust JWT-based Login, Registration, and User Profile Management protected by bcrypt hashing.

---

## 🚦 Application User Flow

Understanding the application lifecycle is straightforward:

1. **Authentication Gate**: Any new visitor is immediately presented with the Login or Registration screen.
2. **Account Creation**: Users must register an account (with automated DB validation and password hashing).
3. **Session Issuance**: Upon successful login, securely encrypted JWT tokens are assigned to the user's local session.
4. **The Dashboard**: Users are redirected to the main dashboard where their reported bugs are strictly displayed.
5. **Issue Triage**: Users can report new bugs (saving the assigned User ID to the DB), search their existing tickets, modify ticket states, or safely delete resolved tickets.
6. **Logout**: User effectively concludes operations and terminates the session manually.

---

## 💻 Tech Stack Galaxy

The application is built on the battle-tested **MERN** stack, augmented entirely for speed and modern standards.

| **Layer** | **Technology** | **Why?** |
| :--- | :--- | :--- |
| **Frontend** | ![React](https://img.shields.io/badge/-React.js-000000?style=flat&logo=react) <br> ![Vite](https://img.shields.io/badge/-Vite-000000?style=flat&logo=vite) | Blazing-fast HMR and highly modular UI components. |
| **Styling** | ![TailwindCSS](https://img.shields.io/badge/-Tailwind_CSS-000000?style=flat&logo=tailwindcss) | Utility-first, zero-bloat CSS for rapid UI development. |
| **Backend** | ![Node.js](https://img.shields.io/badge/-Node.js-000000?style=flat&logo=nodedotjs) <br> ![Express.js](https://img.shields.io/badge/-Express.js-000000?style=flat&logo=express) | Non-blocking, event-driven architecture perfect for APIs. |
| **Database** | ![MongoDB](https://img.shields.io/badge/-MongoDB-000000?style=flat&logo=mongodb) <br> ![Mongoose](https://img.shields.io/badge/-Mongoose-000000?style=flat&logo=mongoose) | Flexible NoSQL schema handling for rapid iteration. |
| **Security** | ![JWT](https://img.shields.io/badge/-JSON_Web_Tokens-000000?style=flat&logo=jsonwebtokens) <br> ![Bcrypt](https://img.shields.io/badge/-Bcrypt.js-000000?style=flat&logo=npm) | Robust stateless authentication and password hashing. |

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
MONGO_URI=your_super_secret_mongodb_cluster_string
PORT=5001
JWT_SECRET=your_super_secret_jwt_signature_key
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
> The magic happens at `http://localhost:5173`. Happy squashin'! 🐛🔨

---

<div align="center">
  <p>Engineered with ☕ and passion by <b>Mahmoud Esawi</b>.</p>
</div>
