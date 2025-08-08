# 🎓 CEG AFFIDAVITS

# Certificate Request and Tracking System - MERN Stack Project

A full-stack web application built with the **MERN** stack (MongoDB, Express.js, React.js, Node.js) that allows **students** to request academic certificates and track the status of their requests through multiple levels of approval — Faculty Advisor (FA), Head of Department (HOD), and Admin Office.

## 🚀 Features

### 👨‍🎓 Student Portal
- Secure login and registration.
- Browse and apply for different certificate categories (e.g., Bonafide, Internship, etc.).
- Upload a **request form** as part of the application.
- Track the progress of each certificate request (Pending → FA → HOD → Admin).
- View **reason for rejection**, if any.
- Preview and **download certificate** once approved and generated.

### 🧑‍🏫 Faculty Advisor Portal
- Login with secure credentials.
- View certificate requests submitted by students.
- Approve or reject requests with optional comments.
- Forward approved requests to HOD.

### 👨‍💼 HOD Portal
- Login with secure credentials.
- View requests forwarded by FA.
- Approve or reject requests with optional comments.
- Forward approved requests to Admin Office.

### 🏢 Admin Office Portal
- Login with secure credentials.
- View requests approved by HOD.
- Final approval and **certificate generation using CloudConvert API**.
- View and verify uploaded request forms.
- Send rejected requests back with reasons.

## 🛠️ Tech Stack

| Frontend        | Backend         | Database  | Others                     |
|----------------|----------------|-----------|----------------------------|
| React.js       | Node.js        | MongoDB   | CloudConvert API (PDF)     |
| React Router   | Express.js     | Mongoose  | JWT for Auth               |
| Axios          | Nodemailer     |           | Multer for File Upload     |


## 🔐 User Roles

- **Student**
- **Faculty Advisor**
- **HOD**
- **Admin Office Staff**

Each user role has specific access and responsibilities to manage the certificate process efficiently.

## 📈 Certificate Request Flow

1. **Student** submits a request with a category and request form.
2. **FA** reviews, adds remarks, and approves or rejects.
3. **HOD** reviews FA-approved requests and takes action.
4. **Admin Office** gives final approval and generates the certificate via **CloudConvert API**.
5. Generated certificate is available to **student** for preview and download.



## 📦 Installation

### Backend Setup

```bash
cd ceg_affidavits
npm install
nodemon start
```

### Frontend Setup

```bash
cd ceg_front
npm install
npm start
```

--⚠️ Ensure you configure .env files for both frontend and backend to store sensitive data like API keys, MongoDB URI, JWT secret, etc.


## 🌍 Deployment

This project is live and accessible on Render:

🔗 **Live URL:** [https://your-app-name.onrender.com](https://ceg-affidavits.onrender.com/)

> ⚠️ Please allow a few seconds for the backend to spin up if inactive (Render free tier auto-sleeps apps).


## Sample Datas For Login

### Student
Roll Number - S001
Password - 1234

### Faculty Advisor
Roll Number - T001
Password - 1234

### HOD
Roll Number - H001
Password - 1234

### Admin
Roll Number - A001
Password - 1234




