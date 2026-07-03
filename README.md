# 🗳️ NUNSA UNIMED Chapter Election System

A secure, modern web-based election platform built for the **Nigerian Universities Nursing Students' Association (NUNSA), University of Medical Sciences (UNIMED) Chapter**. The system enables eligible students to vote electronically while providing administrators with a complete dashboard to manage elections, candidates, voters, and results.

---

## ✨ Features

### 👨‍🎓 Student Portal

* Secure login using registered matriculation numbers.
* One vote per eligible voter.
* Responsive ballot interface.
* Automatic prevention of duplicate voting.
* Success page after voting.
* Real-time election availability based on administrator controls.

### 🗳️ Voting System

* Multiple elective positions.
* Candidate photographs and biographies.
* Single-candidate selection for each position.
* Validation before vote submission.
* Votes are permanently recorded once submitted.

### 👨‍💼 Admin Dashboard

* Create, edit, and delete positions.
* Add, edit, and remove candidates.
* Upload candidate photographs to Cloudinary.
* Register individual voters.
* Bulk voter import.
* Reset individual votes when necessary.
* Enable or disable the election portal instantly.
* Live election statistics.

### 📸 Candidate Photo Management

* Cloudinary image hosting.
* Automatic image replacement.
* Automatic deletion of old images.
* Image optimization during upload.

---

# 🛠 Tech Stack

## Frontend

* React
* React Router
* Axios
* Zustand
* Vanilla CSS

## Backend

* Node.js
* Express.js
* PostgreSQL
* JWT Authentication
* Multer
* Cloudinary

---

# 📁 Project Structure

```
election-app/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── db/
│   │   ├── lib/
│   │   └── index.js
│   └── package.json
│
└── README.md
```

---

# 🔐 Authentication

The application uses **JSON Web Tokens (JWT)** for authentication.

Two user roles are supported:

* **Admin**
* **Voter**

Protected routes ensure that only authenticated users can access their respective dashboards.

---

# 🗄 Database

The application uses PostgreSQL with tables for:

* Positions
* Candidates
* Voters
* Votes
* Site Settings

Votes are linked to both candidates and voters while enforcing one completed ballot per voter.

---

# 📷 Image Storage

Candidate photographs are stored securely using Cloudinary.

Features include:

* Image optimization
* Automatic resizing
* Automatic replacement
* Automatic deletion of removed photos

---

# 🚀 Getting Started

## Clone the repository

```bash
git clone <repository-url>
cd election-app
```

---

## Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
DATABASE_URL=your_database_url

JWT_SECRET=your_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the backend:

```bash
npm run dev
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm start
```

---

# 📦 Environment Variables

Backend:

```
DATABASE_URL

JWT_SECRET

CLOUDINARY_CLOUD_NAME

CLOUDINARY_API_KEY

CLOUDINARY_API_SECRET
```

---

# 🔒 Security Features

* JWT authentication
* Protected API endpoints
* One-time voting enforcement
* Server-side validation
* Admin authorization middleware
* Election enable/disable switch
* Secure image uploads
* Duplicate vote prevention

---

# 🎯 Future Improvements

* Election audit logs
* Two-factor authentication for administrators
* Live voter turnout dashboard
* Email notifications
* Election scheduling
* Position-based voting rules (e.g., Yes/No voting for unopposed candidates)
* CSV export of election results
* Printable election reports

---

# 📄 License

This project was developed for the **NUNSA UNIMED Chapter** to facilitate transparent, efficient, and secure student elections.

It may be adapted for educational institutions and student organizations with appropriate customization.

---

# 👨‍💻 Author

**Boluwatife Jolayemi**

Full-Stack Developer

Specializing in modern web applications, secure authentication systems, and software solutions for educational and organizational use.