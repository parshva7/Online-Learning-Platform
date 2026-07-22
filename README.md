<div align="center">

# 🎓 Online Learning Platform

### A Full-Stack Learning Management System built with React, Express, Supabase & Razorpay

<p>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black"></a>
  <a href="https://vite.dev"><img src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white"></a>
  <a href="https://expressjs.com"><img src="https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white"></a>
  <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-Database-3FCF8E?logo=supabase&logoColor=white"></a>
  <a href="https://razorpay.com"><img src="https://img.shields.io/badge/Razorpay-Payments-3395FF?logo=razorpay&logoColor=white"></a>
</p>

<p>
  <img src="https://img.shields.io/github/stars/parshva7/Online-Learning-Platform?style=social">
  <img src="https://img.shields.io/github/forks/parshva7/Online-Learning-Platform?style=social">
</p>

</div>

---

# 📖 Overview

Online Learning Platform is a full-stack Learning Management System (LMS) that enables instructors to create and manage courses while allowing students to purchase, learn, and track their progress through an interactive dashboard.

---

# ✨ Features

## 👨‍🎓 Student

- Register & Login
- Browse Courses
- Purchase Courses
- Watch Video Lectures
- Attempt Quizzes
- Track Learning Progress

## 👨‍🏫 Instructor

- Instructor Authentication
- Create Courses
- Upload Videos
- Create Quizzes
- Edit/Delete Courses
- Manage Students

## 💳 Payments

- Razorpay Checkout
- Secure Payment Verification
- Purchase History

## 🔒 Security

- JWT Authentication
- bcrypt Password Hashing
- Protected Routes
- Supabase Authentication

---

# 🛠 Tech Stack

| Frontend | Backend | Database | Payment |
|----------|----------|----------|----------|
| React 19 | Express.js | Supabase | Razorpay |
| Vite | Node.js | PostgreSQL | Payment Gateway |
| React Router | REST APIs | Authentication | |

---

# 📂 Project Structure

```text
ONLINE_LEARNING_APP
│
├── frontend
│   ├── src
│   ├── public
│   ├── package.json
│   └── vite.config.js
│
├── backend
│   ├── src
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── README.md
```

---

# ⚙️ Installation

### Clone

```bash
git clone https://github.com/parshva7/Online-Learning-Platform.git
```

### Install

```bash
cd frontend
npm install

cd ../backend
npm install
```

### Configure Environment

```env
SUPABASE_URL=

SUPABASE_SERVICE_KEY=

RAZORPAY_KEY_ID=

RAZORPAY_KEY_SECRET=
```

### Run Backend

```bash
cd backend
node server.js
```

### Run Frontend

```bash
cd frontend
npm run dev
```

---

# 🌐 API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | / | Health Check |
| POST | /payment/create-order | Create Razorpay Order |
| POST | /payment/verify | Verify Payment |

---

# 🚀 Deployment

| Service | Platform |
|----------|----------|
| Frontend | Netlify |
| Backend | Render |
| Database | Supabase |

---

# 📸 Screenshots

Add screenshots here.

### Home Page

<img src="images/home.png" width="900">

### Student Dashboard

<img src="images/student-dashboard.png" width="900">

### Instructor Dashboard

<img src="images/instructor-dashboard.png" width="900">

---

# 🔮 Future Scope

- AI Course Recommendation
- Certificates
- Discussion Forum
- Live Classes
- Assignment Submission
- Dark Mode

---

# 👨‍💻 Author

**Parshva Panchal**

- LinkedIn: https://linkedin.com/in/parshvap1
- GitHub: https://github.com/parshva7

---

<div align="center">

⭐ **If you like this project, don't forget to Star the repository!**

</div>

![GitHub Repo stars](https://img.shields.io/github/stars/parshva7/Online-Learning-Platform?style=for-the-badge)
![GitHub forks](https://img.shields.io/github/forks/parshva7/Online-Learning-Platform?style=for-the-badge)
![GitHub last commit](https://img.shields.io/github/last-commit/parshva7/Online-Learning-Platform?style=for-the-badge)
![GitHub issues](https://img.shields.io/github/issues/parshva7/Online-Learning-Platform?style=for-the-badge)
