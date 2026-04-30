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

---

## 1. **Backend and Frontend URLs Mismatch**

- **Problem:** Your frontend is likely still trying to POST to `http://localhost:5000/api/auth` (or other localhost URLs), but in production, your backend is running at a different URL (e.g., on Render, Heroku, or another server).
- **Solution:**  
  - Update your frontend to use the deployed backend URL for all API requests.
  - You can do this by using an environment variable (e.g., `VITE_API_URL`) and referencing it in your axios calls:
    ```js
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    axios.post(`${API_URL}/api/auth`, { ... })
    ```
  - Set `VITE_API_URL` in your deployment environment to your backend's deployed URL.

---

## 2. **CORS Issues**

- **Problem:** If your backend is not configured to allow requests from your deployed frontend, the browser will block the request.
- **Solution:**  
  - Make sure your Flask backend uses CORS and allows your deployed frontend's domain:
    ```python
    from flask_cors import CORS
    CORS(app, origins=["https://your-frontend-domain.com"])
    ```
  - Or, for testing, use `CORS(app)` to allow all origins (not recommended for production).

---

## 3. **Backend User List**

- **Problem:** If you are using in-memory users, and your backend was restarted, only the default users exist (e.g., `admin`/`admin`). Any users you signed up locally are not present.
- **Solution:**  
  - Try logging in with the default credentials (`admin`/`admin`).
  - If you want persistent users, you need to use a database (e.g., PostgreSQL) instead of in-memory storage.

---

## 4. **Check Network Requests**

- Open your browser's DevTools → Network tab.
- Try to log in.
- Check the request to `/api/auth`:
  - What is the URL? (Should be your deployed backend, not localhost)
  - What is the response? (401, CORS error, 404, etc.)

---

## 5. **Summary of What To Do**

1. **Update your frontend to use the deployed backend URL.**
2. **Make sure your backend allows CORS from your frontend's domain.**
3. **Try logging in with default credentials (`admin`/`admin`).**
4. **Check the Network tab for errors and let me know what you see.**

---

Your deployed frontend is live at [https://mealy-steel.vercel.app/](https://mealy-steel.vercel.app/), but you are experiencing login failures. This is a very common issue when deploying a full-stack app, and it almost always comes down to the frontend not talking to the correct backend URL.

---

## Here’s how to fix it:

### 1. **Update Your Frontend to Use the Deployed Backend URL**

Right now, your frontend is probably trying to POST to `http://localhost:5000/api/auth`, which will not work in production.  
You need to make sure all axios/fetch calls use your deployed backend URL (e.g., `https://your-backend.onrender.com/api/auth`).

**How to do this:**
- In your React code, use an environment variable for the API base URL:
  ```js
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  axios.post(`${API_URL}/api/auth`, { ... })
  ```
- In your Vercel project settings, set the environment variable `VITE_API_URL` to your deployed backend URL (e.g., `https://your-backend.onrender.com`).

### 2. **Make Sure Your Backend Allows CORS**

In your Flask backend, make sure you have:
```python
from flask_cors import CORS
CORS(app, origins=["https://mealy-steel.vercel.app"])
```
Or, for testing:
```python
CORS(app)
```
But for production, specify your frontend domain for security.

### 3. **Try Logging in with Default Credentials**

If your backend uses in-memory users, only the default users exist after a restart:
- Username: `admin`
- Password: `admin`

If you want persistent users, you need to use a database.

### 4. **Check the Network Tab**

- Open DevTools → Network tab.
- Try to log in.
- Check the request to `/api/auth`:
  - Is it going to your deployed backend, or to localhost?
  - What is the response? (401, CORS error, 404, etc.)

---

## Summary

- Set `VITE_API_URL` in your Vercel project to your backend’s deployed URL.
- Update your React code to use this variable for all API requests.
- Make sure your backend allows CORS from your frontend domain.
- Try logging in with the default credentials.

---

If you provide your backend’s deployed URL, I can give you the exact value to use for `VITE_API_URL` and the code to update.  
If you still have issues, let me know what you see in the Network tab after trying to log in.

---

**Reference:**  
- [https://mealy-steel.vercel.app/](https://mealy-steel.vercel.app/)

---

To fix the login issue on your deployed frontend ([https://mealy-steel.vercel.app/](https://mealy-steel.vercel.app/)), follow these steps:

---

## 1. **Set the API URL in Your Frontend**

**a. Update your React code to use an environment variable for the backend URL:**

In your axios calls (e.g., in `AuthForm.tsx`, `AdminDashboard.tsx`, etc.), replace:
```js
axios.post("http://localhost:5000/api/auth", { ... })
```
with:
```js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
axios.post(`${API_URL}/api/auth`, { ... })
```
Do this for all axios/fetch calls to your backend.

---

**b. In your Vercel project settings:**
- Go to your project on Vercel.
- Go to **Settings > Environment Variables**.
- Add a new variable:
  - **Key:** `VITE_API_URL`
  - **Value:** `https://your-backend-url.com` (replace with your actual deployed backend URL, e.g., `https://mealy-backend.onrender.com`)
- Redeploy your frontend after saving the variable.

---

## 2. **Allow CORS in Your Flask Backend**

In your `backend/app.py`, make sure you have:
```python
from flask_cors import CORS
CORS(app, origins=["https://mealy-steel.vercel.app"])
```
Or, for testing:
```python
CORS(app)
```
Then redeploy or restart your backend.

---

## 3. **Try Logging In Again**

- Use the default credentials (`admin`/`admin`) or a user you created via signup.
- If you still get an error, open your browser’s DevTools → Network tab, and check the request to `/api/auth`:
  - Is it going to your deployed backend, or to localhost?
  - What is the response? (401, CORS error, 404, etc.)

---

## 4. **Summary Checklist**

- [ ] All axios/fetch calls use `VITE_API_URL` (not hardcoded localhost).
- [ ] `VITE_API_URL` is set in Vercel to your backend’s deployed URL.
- [ ] Flask backend allows CORS from your frontend domain.
- [ ] Both frontend and backend are redeployed/restarted.

---

If you provide your backend’s deployed URL, I can give you the exact value to use for `VITE_API_URL` and the code to update.  
If you still have issues, let me know what you see in the Network tab after trying to log in.

---

**Reference:**  
- [https://mealy-steel.vercel.app/](https://mealy-steel.vercel.app/)

Absolutely! Here’s exactly how to fix your deployed login issue step by step:

---

## 1. **Update Your React Code to Use an Environment Variable for the API URL**

**a. In every file where you use axios/fetch to call your backend (e.g., `AuthForm.tsx`, `AdminDashboard.tsx`, etc.), replace:**
```js
axios.post("http://localhost:5000/api/auth", { ... })
```
**with:**
```js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
axios.post(`${API_URL}/api/auth`, { ... })
```
Do this for all axios/fetch calls to your backend (meals, orders, auth, etc.).

---

## 2. **Set the Environment Variable in Vercel**

- Go to your project on Vercel.
- Go to **Settings > Environment Variables**.
- Add a new variable:
  - **Key:** `VITE_API_URL`
  - **Value:** `https://your-backend-url.com` (replace with your actual deployed backend URL, e.g., `https://mealy-backend.onrender.com`)
- Save and redeploy your frontend.

---

## 3. **Update Flask CORS Settings**

In your `backend/app.py`, make sure you have:
```python
from flask_cors import CORS
CORS(app, origins=["https://mealy-steel.vercel.app"])
```
Or, for testing:
```python
CORS(app)
```
Then redeploy or restart your backend.

---

## 4. **Redeploy Both Frontend and Backend**

- After making these changes, redeploy your backend and frontend.
- Try logging in again at [https://mealy-steel.vercel.app/](https://mealy-steel.vercel.app/).

---

## 5. **Test and Debug**

- Open your browser’s DevTools → Network tab.
- Try to log in.
- Make sure the request to `/api/auth` is going to your deployed backend, not localhost.
- If you still get an error, let me know what the response is (401, CORS error, 404, etc.).

---

## 6. **If You Want Me to Make the Code Changes**

If you paste your backend URL here (e.g., `https://mealy-backend.onrender.com`), I can:
- Edit your React code to use the environment variable everywhere.
- Show you exactly what to set in Vercel.

---

**Summary:**  
- Use `VITE_API_URL` in your React code for all backend calls.
- Set `VITE_API_URL` in Vercel to your backend’s deployed URL.
- Allow CORS from your frontend domain in Flask.
- Redeploy both frontend and backend.

Let me know your backend URL and I’ll give you the exact code to copy-paste!
