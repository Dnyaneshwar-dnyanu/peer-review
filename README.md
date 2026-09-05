<div align="center">
            <img width="400" height="300" alt="fd4656d0-fab6-4c3c-a958-aed5f8833169" src="https://github.com/user-attachments/assets/01c05d14-2454-4d40-952d-27412cfb5095" />
            <br>
            A full-stack web application designed to streamline the <b>academic peer review process</b> in colleges.
            <br>
            The platform enables  <b>teachers to create classrooms</b> ,  <b>students to submit projects</b> , and <b>teachers to evaluate projects</b> with structured feedback and marks.
</div>

<br>

<hr />

## 🚀 Live Demo

- 🌐 Frontend: [https://student-peer-review-nu.vercel.app/](https://student-peer-review-nu.vercel.app/)
- 🔗 Backend: [https://peer-review-backend-r75l.onrender.com](https://peer-review-backend-r75l.onrender.com)

## 🚀 Features

<table>
<tr>
<td width="33%" valign="top">

### 👩‍🏫 Teacher

- Create and manage classrooms
- Generate unique room codes
- View participants and submitted projects
- Evaluate student projects (marks + feedback)
- Close classrooms to stop submissions
- Export evaluation data as Excel (XLSX)

</td>

<td width="33%" valign="top">

### 🧑‍🎓 Student

- Join classrooms using room code
- Submit project details
- View feedback and marks
- Submit feedback and marks to others projects
- Automatic redirection when classroom is closed

</td>

<td width="33%" valign="top">

### 🔐 General

- Secure authentication
- Role-based access control (Teacher / Student)
- JWT authentication with cookies
- Real-time UI updates using polling
- Clean glassmorphism UI
- Responsive design

</td>
</tr>
</table>

---

## 🧭 Architecture Diagram

<img width="1300" height="500" alt="image" src="https://github.com/user-attachments/assets/65f91d02-6ed0-4e76-ba1f-f8920b9ac506" />

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

## ▶️ How to Run the Project

### 1️⃣ Clone the repository

```
git clone https://github.com/dnyaneshwar-dnyanu/peer-review-system.git
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

## 📈 Monitoring

### UptimeRobot

* Monitor `GET /healthz` for uptime
* Optionally monitor `GET /readyz` for database readiness
* Use the public backend URL (Render) for checks and alerts

### Prometheus

* A sample Prometheus configuration is provided in `prometheus.yml`
* Default scrape target: `host.docker.internal:3000`
* If you expose a metrics endpoint (for example, `/metrics`), update the scrape config accordingly

---

## 🧪 DevOps Pipeline (CI/CD)

This repository includes a GitHub Actions workflow at `.github/workflows/main.yml`.

### On every push or pull request to `main`

* **Security - Audit & Scan**: installs dependencies, runs `npm audit`, builds backend image, and scans with Trivy
* **Backend - Test**: installs backend dependencies and runs `npm test`
* **Frontend - Lint, Test & Build**: runs `npm run lint`, `npm test`, and `npm run build`

### On push to `main`

* **Backend - Build & Push Docker Image**: pushes to GitHub Container Registry (GHCR)
* **Backend - Trigger Render Deployment**: calls the Render deploy hook and verifies `/healthz`

### CI/CD secrets

* `RENDER_DEPLOY_HOOK` - triggers backend deploy on Render
* `BACKEND_HEALTH_URL` - base URL for health checks (example: `https://peer-review-backend.onrender.com`)
* `RENDER_ROLLBACK_HOOK` - optional rollback hook for auto-revert on failed health checks

---

## 🚀 Future Implementations

* 📊 **Multi-Criteria Rubric Evaluation** – Support weighted grading criteria with automatic score calculation.
* 📅 **Interactive Presentation Scheduling** – Enable calendar-based presentation slot booking.
* 🤖 **AI-Assisted Feedback & Plagiarism Detection** – Use AI to assist evaluation and detect potential plagiarism.
* 🔗 **GitHub/GitLab Repository Linking** – Link repositories to retrieve project and commit details.
* ⚡ **Real-Time WebSocket Notifications** – Provide instant in-app and email notifications.
* 📈 **Classroom & Departmental Analytics Dashboards** – Visualize grades, submissions, and performance trends.
* 📝 **Student Activity Audit Trail** – Track student actions and evaluation activities with timestamps.

---

### 👨‍💻 Author

Built to help college teachers streamline project evaluation, reduce manual effort, and make the review process more efficient and transparent.
