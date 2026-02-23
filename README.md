# 🐞 Full-Stack Bug Tracker

![Bug Tracker Banner](https://img.shields.io/badge/Status-Active-brightgreen)
![React](https://img.shields.io/badge/Frontend-React.js-blue)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248)
![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS-38B2AC)

A modern, responsive, and full-stack Issue/Bug Tracking System built with the **MERN** stack (MongoDB, Express, React, Node.js). This project is designed to help individuals and teams efficiently report, track, and manage software bugs and technical issues.

## ✨ Key Features
- **Full CRUD Operations**: Create new bugs, view active tickets, update ticket statuses (Mark as Done), and delete resolved easily.
- **RESTful API backend**: Fully custom Node.js & Express server connected to a MongoDB database.
- **Modern UI/UX**: Clean and intuitive interface built utilizing Tailwind CSS.
- **Real-time State Management**: Handles loading and ticket updates seamlessly with React Hooks (`useState` & `useEffect`).
- **Priority Labeling**: Automatically color-codes tickets based on severity (Low, Medium, High).

<br/>

## 🛠️ Technology Stack

### Frontend (Client)
- **Vite + React.js**: Extremely fast frontend build tool and progressive JS framework.
- **Tailwind CSS**: Utility-first CSS framework for rapid and responsive styling.
- **Axios**: Promise-based HTTP client for making API requests.

### Backend (Server)
- **Node.js + Express.js**: Fast, unopinionated, minimalist web framework for building APIs.
- **MongoDB + Mongoose**: NoSQL database and elegant object modeling for managing schema.
- **CORS & Dotenv**: Secure cross-origin resource sharing and environment variable management.

<br/>

## 🚀 Getting Started

To run this project locally, follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/MahmoudEsawi/Full-stack-Bug-Tracker.git
cd Full-stack-Bug-Tracker
```

### 2. Setup the Backend
Open a terminal and navigate to the backend directory:
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder and add your MongoDB connection string and Port:
```env
MONGO_URI=your_mongodb_connection_string_here
PORT=5001
```
Start the backend server:
```bash
npm run dev
```

### 3. Setup the Frontend
Open another terminal and navigate to the frontend directory:
```bash
cd frontend
npm install
```
Start the frontend development server:
```bash
npm run dev
```

The app will start running on `http://localhost:5173`. Enjoy tracking bugs! 🚀

---
*Built by Mahmoud Esawi*
