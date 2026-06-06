# 🎓 ICT Academy LMS — Learning Management System

An enterprise-ready, premium, and fully-featured **Learning Management System (LMS)** designed for modern educational academies. This repository contains the complete codebase, comprising a robust Node.js backend, a high-performance Next.js landing page, a modern React-based Student Dashboard, and an intuitive Admin Panel.

---

## 🏗️ Architecture & Project Structure

The project is structured as a monorepo consisting of the backend API service and three frontend portals:

```
LMS/
├── backend/                  # Node.js + Express API server (Dockerized)
│   ├── uploads/              # Storage directory for uploaded course materials
│   ├── server.js             # Main server logic, API endpoints & WebSocket handler
│   ├── seed_data.js          # DB seeder for initial courses, students & metrics
│   └── Dockerfile            # Hugging Face Spaces deployment config
│
└── frontend/                 # Frontend Portals
    ├── landing/              # Next.js 16 (App Router) + Tailwind CSS v4 website
    ├── student/              # React + Vite + Tailwind CSS v4 + Radix Student Dashboard
    └── admin/                # React + Vite Admin Console
```

---

## 🚀 Key Features

### 🌟 1. Landing Page (`frontend/landing`)
* **Dynamic Course Grid:** Displays active courses with pricing and descriptions fetched in real-time from the backend.
* **Inquiry Portal:** Interactive contact form allowing prospective students to send direct inquiries.
* **Responsive Layout:** Premium mobile-first design with smooth scroll and optimized typography using Next.js fonts.

### 🧑‍🎓 2. Student Dashboard (`frontend/student`)
* **Interactive Course Player:** Access class recordings, PDFs, course notes, and external links organized by course.
* **Real-time Admin Support:** Live chat widget powered by **Socket.io** enabling direct, instant communication with academy admins.
* **Announcements & Notifications:** Receive global and course-specific announcements instantly.
* **Rich Visual Analytics:** Detailed statistics and learning graphs powered by **Recharts**.
* **Premium UX/UI:** Designed with Tailwind CSS v4, Framer Motion animations, Radix UI primitives, and polished HSL color palettes.

### 🛡️ 3. Admin Console (`frontend/admin`)
* **User Management:** Full CRUD operations on Students and Admin accounts, including instant password resets.
* **Course & Content Manager:** Create courses, publish Announcements, upload notes, link PDF resources, and embed class video recordings.
* **Support Ticket Desk:** Manage contact inquiries and reply directly to students via email (SMTP or Resend API) with rich HTML templates.
* **Live Chat Center:** Real-time multi-agent chat interface to reply to active students instantly.
* **System Settings:** Modify core academy metrics (base student count, pass rates, support contacts) directly.

---

## 🛠️ Technology Stack

### Backend
* **Runtime:** Node.js, Express.js
* **Database:** MySQL / TiDB Serverless (with connection pooling)
* **Real-time WebSockets:** Socket.io
* **Security & Auth:** JSON Web Tokens (JWT), BcryptJS
* **Mailing:** Nodemailer (SMTP) & Resend REST API integration

### Frontends
* **Landing Page:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide Icons
* **Student Dashboard:** React 18, Vite 6, Tailwind CSS v4, Radix UI, Material UI (MUI) Icons, Motion, Recharts
* **Admin Dashboard:** React 18, Vite 5, CSS Variables, Socket.io-client

---

## 📦 Getting Started & Local Setup

### Prerequisite: Database Setup
1. Spin up a MySQL or TiDB Serverless database.
2. The backend will **automatically initialize the schema** (create required tables) on its first start.

### 1. Run the Backend Server
```bash
cd backend
npm install

# Seed demo data (Students, past payments/enrollments, and courses)
npm run seed     # or node seed_data.js

# Start the development server
npm run dev
```
> **Default Admin Account:**
> * **Username/Phone:** `0777777777`
> * **Password:** `admin123`

### 2. Run the Landing Page
```bash
cd frontend/landing
npm install
npm run dev
```
*Accessible at:* `http://localhost:3000`

### 3. Run the Student Dashboard
```bash
cd frontend/student
npm install
npm run dev
```
*Accessible at:* `http://localhost:5173`

### 4. Run the Admin Dashboard
```bash
cd frontend/admin
npm install
npm run dev
```
*Accessible at:* `http://localhost:5174`

---

## ☁️ Deployment

### 🐳 Deploy Backend on Hugging Face Spaces (Docker SDK)
1. Create a new Space on Hugging Face.
2. Select **Docker** as the SDK and choose the **Blank** template.
3. Add the environment variables specified in the [Environment Configurations](#environment-configurations) section as **Repository Secrets** in the Space's Settings.
4. Push the contents of the `backend/` directory (or the root repository pointing to the backend Dockerfile) to the Space.

### ⚡ Deploy Frontends on Vercel
All frontends include a `vercel.json` configuration file and are fully optimized for one-click deployment on the **Vercel Platform**:
1. Connect your GitHub repository to Vercel.
2. Deploy `frontend/landing`, `frontend/student`, and `frontend/admin` as three separate projects.
3. Configure the `REACT_APP_BACKEND_URL` or environment variables to point to your live backend endpoint.

---

## 🤝 License
This project is licensed under the MIT License.
