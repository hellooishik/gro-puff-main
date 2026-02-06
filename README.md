# FreshPro

Full-stack e-commerce quick-commerce application.

## Tech Stack
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT
- **Frontend**: React (Vite), Tailwind CSS, Context API

## Prerequisites
- Node.js installed
- MongoDB installed and running locally on port 27017

## Setup Instructions

1.  **Install Dependencies**
    ```bash
    # Backend
    cd backend
    npm install

    # Frontend
    cd ../frontend
    npm install
    ```

2.  **Environment Variables**
    - Backend: `backend/.env` is pre-configured. Ensure `MONGO_URI` points to your running MongoDB instance (`mongodb://127.0.0.1:27017/gopuff_clone`).

3.  **Seed Database**
    ```bash
    cd backend
    node seeder.js
    ```
    *Note: Ensure MongoDB is running before seeding.*

4.  **Run Application**
    
    start backend:
    ```bash
    cd backend
    npm run dev
    ```

    start frontend:
    ```bash
    cd frontend
    npm run dev
    ```

## Features
- **Authentication**: Login/Register with JWT.
- **Product**: Browse categories, search, view details.
- **Cart**: Add/Remove items, view summary.
- **Orders**: Place orders (Mock), view history.
- **Admin**: Product/Order management (API endpoints ready, UI integration enabled via role).
