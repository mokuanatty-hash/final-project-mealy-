# Mealy (Group 4)

## Project Overview
Mealy is a full-stack food ordering application that allows customers to make food orders and helps food vendors (caterers/admins) manage menus and track orders. This project demonstrates advanced skills in React (frontend), Flask (backend), and PostgreSQL (database), and is designed as a capstone for the Phase 5 curriculum.

## Project Team & Responsibilities
- **Laetitia Kamangu (Scrum Master):** Project management, sprint planning, and team coordination
- **Lawrence Wambugu:** Frontend development (React, UI/UX, customer dashboard)
- **Andrew Tobiko:** Backend development (Flask API, authentication, order persistence)
- **George Mbugua:** Admin dashboard, order management, and integration
- **Lee Thuku:** Testing, documentation, and deployment

---

## Features
### Required Features
1. Users can create an account and log in
2. Admin (Caterer) can manage (add, modify, delete) meal options
3. Admin (Caterer) can set up a menu for a specific day by selecting from available meal options
4. Authenticated users (customers) can see the menu for a specific day and select a meal
5. Authenticated users (customers) can change their meal choice
6. Admin (Caterer) can see all orders made by users
7. Admin can see the total amount of money made by end of day

### Extra Features
1. Authenticated users (customers) can see their order history
2. Authenticated users (customers) get notifications when the menu for the day is set
3. Admin (Caterer) can see order history
4. The application can host more than one caterer

---

## Technical Expectations
- **Backend:** Python Flask (with SQLAlchemy, PostgreSQL)
- **Frontend:** ReactJS & Redux Toolkit (state management)
- **Database:** PostgreSQL
- **Wireframes:** Figma (mobile friendly)
- **Testing:** Jest (frontend), Minitests (backend)

---

## Phase 5 Project Requirements Checklist
- [x] Flask and SQLAlchemy backend
- [x] Many-to-many relationship (e.g., users <-> orders <-> meals)
- [x] At least 4 models (User, Meal, Menu, Order)
- [x] At least 5 client-side routes using React Router
- [x] Full CRUD on at least 1 model (meals, orders, or menu), following REST conventions
- [x] Validations and error handling
- [x] Something new not taught in the curriculum (e.g., persistent file storage, notifications, or advanced UI/UX)
- [x] useContext or Redux for state management

---

## Organization & Tools
- **Kanban/Scrum Board:** [GitHub Project Board](https://github.com/Tobikorais/Mealy/projects)
- **Pomodoro Timer:** [Marinara Timer](https://marinara-timer.com/)

---

## How to Run the Project

### Backend
1. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
2. Start the backend server:
   ```bash
   python3 backend/app.py
   ```

### Frontend
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the frontend dev server:
   ```bash
   npm run dev
   ```
3. Open the local URL provided by Vite (e.g., http://localhost:8080/)

---

## About
This project is a capstone for the Phase 5 curriculum, demonstrating full-stack development, teamwork, and advanced technical skills.
