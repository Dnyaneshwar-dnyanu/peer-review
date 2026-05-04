<div align="center">
            <img width="400" height="400" alt="fd4656d0-fab6-4c3c-a958-aed5f8833169" src="https://github.com/user-attachments/assets/01c05d14-2454-4d40-952d-27412cfb5095" />
            <br>
            A full-stack web application designed to streamline the <b>academic peer review process</b> in colleges.
            <br>
            The platform enables  <b>teachers to create classrooms</b> ,  <b>students to submit projects</b> , and <b>teachers to evaluate projects</b> with structured feedback and marks.
</div>

<br>

<hr />

## 🚀 Live Demo

- 🌐 Frontend: [https://peer-review-system.vercel.app](https://student-peer-review-nu.vercel.app/)
- 🔗 Backend: [https://peer-review-backend.onrender.com](https://peer-review-yyx3.onrender.com)

## 🚀 Features

### 👩‍🏫 Teacher

* Secure authentication
* Create and manage classrooms
* Generate unique room codes
* View participants and submitted projects
* Evaluate student projects (marks + feedback)
* Close classrooms to stop submissions
* Export evaluation data as CSV

### 🧑‍🎓 Student

* Secure authentication
* Join classrooms using room code
* Submit project details
* View feedback and marks
* Automatic redirection when classroom is closed

### 🔐 General

* Role-based access control (Teacher / Student)
* JWT authentication with cookies
* Real-time UI updates using polling
* Clean glassmorphism UI
* Responsive design

---

### 🧠 System Architecture

```
            Frontend (React + Tailwind)         `

            ↓ Backend (Node.js + Express)`

            ↓ Database (MongoDB)`
```

* Frontend handles UI and user interaction
* Backend handles authentication, business logic, and CSV export
* MongoDB stores users, rooms, projects, and reviews

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Tailwind CSS
* React Router

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* bcrypt

---

## 🔐 Authentication Flow

* JWT token generated on login
* Token stored in **HTTP cookies**
* Middleware validates user on every protected route
* Role-based authorization ensures correct access

---

## 🔄 Real-Time Updates Strategy

The system uses **polling** to synchronize data across users.

* Client fetches updated room/project data every few seconds
* Ensures all users see latest submissions and reviews
* Stable and suitable for academic environments
* Avoids complexity of WebSockets

---

## 📊 CSV Export Feature

* Teachers can download evaluation data in CSV format
* CSV is generated dynamically on backend
* Includes student details, project title, marks, and feedback
* File opens directly in Excel / Google Sheets

---

## 🧪 Testing Note (Important)

> Cookies are shared across browser tabs.

To test  **Teacher and Student simultaneously** , use:

* Different browsers (Chrome & Brave), or
* Incognito window

This ensures correct session isolation.

---

## ▶️ How to Run the Project

### 1️⃣ Clone the repository

```
git clone https://github.com/your-username/peer-review-system.git
```

### 2️⃣ Backend setup

```
cd backend
npm install
npm start
```

Create a .env file:

```
MONGO_URI=mongodb://localhost:27017/peer-review
JWT_KEY=your_secret_key
FRONTEND_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5173
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
LOG_LEVEL=info
```

### 3️⃣ Frontend setup

```
cd frontend
npm install
npm run dev
```

---

## 🔧 Operations Runbook

### Environments

* Local: `http://localhost:5173` (frontend) + `http://localhost:3000` (backend)
* Dev/Staging: Use dedicated URLs and isolated MongoDB instances
* Production: Render backend + Vercel frontend (or your hosting setup)

### Health and readiness

* `GET /healthz` returns process status and uptime
* `GET /readyz` returns readiness based on MongoDB connection

### Logs

* JSON structured logs with `timestamp`, `level`, `message`, `requestId`, `userId`, `latencyMs`
* Set log level via `LOG_LEVEL` (e.g., `info`, `warn`, `error`)

### CI/CD secrets

* `RENDER_DEPLOY_HOOK` - triggers backend deploy on Render
* `BACKEND_HEALTH_URL` - base URL for health checks (example: `https://peer-review-backend.onrender.com`)
* `RENDER_ROLLBACK_HOOK` - optional rollback hook for auto-revert on failed health checks

---

## 💾 Backup and Restore

Prerequisites: MongoDB Database Tools (`mongodump`, `mongorestore`) installed on the machine.

### Backup (Linux/macOS)

```
export MONGO_URI=mongodb://localhost:27017/peer-review
export BACKUP_DIR=./backups
./backend/scripts/backup.sh
```

### Backup (Windows PowerShell)

```
$env:MONGO_URI="mongodb://localhost:27017/peer-review"
$env:BACKUP_DIR=".\backups"
./backend/scripts/backup.ps1
```

### Restore (Linux/macOS)

```
export MONGO_URI=mongodb://localhost:27017/peer-review
export BACKUP_PATH=./backups/20260101-120000
./backend/scripts/restore.sh
```

### Restore (Windows PowerShell)

```
$env:MONGO_URI="mongodb://localhost:27017/peer-review"
$env:BACKUP_PATH=".\backups\20260101-120000"
./backend/scripts/restore.ps1
```

### Restore drill (recommended monthly)

* Take a fresh backup from production
* Restore into staging or a local environment
* Run smoke tests (login, create room, add project)
* Record duration and any issues in the release notes

---

## 🚨 Incident Response

* Triage: confirm impact and capture request IDs from logs
* Mitigate: rollback via `RENDER_ROLLBACK_HOOK` or redeploy last known good image
* Communicate: post status update to stakeholders
* Resolve: fix root cause and deploy patch
* Postmortem: document timeline, fix action items, add tests

---

## ✅ Release Checklist

* Ensure CI green: tests, lint, security audit, Trivy scan
* Verify environment variables and secrets
* Run database backup before production deploy
* Deploy and verify `GET /healthz` and `GET /readyz`
* Monitor logs for errors and latency spikes
* Update release notes

---

## 🛡️ Governance

Branch protection recommendation (GitHub):

* Require pull request reviews
* Require status checks:
    * `Backend - Test`
    * `Frontend - Lint, Test & Build`
    * `Security - Audit & Scan`
* Require branches to be up to date before merging
* Restrict who can push to `main`

---

### 🎓 Academic Relevance

This project demonstrates:

* Full-stack development
* Secure authentication
* Role-based access control
* Database design
* REST API design
* UI/UX principles
* Real-world problem solving

---

### 👨‍💻 Author

Developed as an academic project to improve transparency and efficiency in project evaluation systems.
