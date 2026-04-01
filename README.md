# 📚 Library Management System

A full-stack **Library Management System (LMS)** built using **React (Frontend)** and **Python (Backend)** to manage books, users, and transactions efficiently.

---

## 🚀 Features

* 🔐 User Authentication (Login System)
* 📖 Book Management (Add / Update / Delete)
* 👥 Membership Management
* 🔄 Book Issue & Return System
* 💰 Fine Payment Handling
* 📊 Reports & Transactions Module
* 🛠 Maintenance Module (Core Requirement)

---

## 🛠 Tech Stack

**Frontend:**

* React.js
* CSS

**Backend:**

* Python (Flask / FastAPI based)
* REST APIs

**Tools:**

* VS Code
* Git & GitHub

---

## 📂 Project Structure

```
Library Management system/
│
├── backend/
│   ├── server.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── package.json
│   └── src/
│       ├── App.js
│       ├── AuthContext.js
│       ├── ProtectedRoute.js
│       │
│       ├── components/
│       │   ├── BookManagement.js
│       │   └── MembershipManagement.js
│       │
│       └── pages/
│           ├── Dashboard.js
│           ├── Login.js
│           ├── UserManagement.js
│           ├── Maintenance.js
│           ├── Transactions.js
│           ├── Reports.js
│           ├── IssueBook.js
│           ├── ReturnBook.js
│           └── FinePayment.js
│
├── design_guideline.json
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```
git clone https://github.com/nishantverma0/Library-Magement-System.git
cd Library-Magement-System
```

---

## 🔧 Backend Setup

```
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt
python server.py
```

👉 Backend runs at:
`http://localhost:5000`

---

## 💻 Frontend Setup

Open new terminal:

```
cd frontend
npm install
npm start
```

👉 Frontend runs at:
`http://localhost:3000`

---

## 🔗 API Integration

* Ensure backend is running before frontend
* Configure API base URL if required in frontend
* Use `.env` for environment variables

---

## 📸 Screenshots (Optional)

*Add screenshots of your UI here for better presentation*

---

## 🧪 Future Enhancements

* 🔹 Database Integration (MongoDB / MySQL)
* 🔹 JWT Authentication
* 🔹 Role-Based Access Control (Admin/User)
* 🔹 UI Improvements (Tailwind / Material UI)
* 🔹 Deployment (Vercel + Render)

---

## 📌 Key Notes

* Maintenance module is mandatory for reports & transactions
* Radio buttons → Single selection
* Checkboxes → Boolean (Yes/No)

---

## 👨‍💻 Author

**Nishant Verma**

* GitHub: https://github.com/nishantverma0
* LinkedIn: *Add your profile link here*

---

## 📄 License

This project is developed for academic and learning purposes.

---
