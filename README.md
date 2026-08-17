# CineTrack &bull; Movie & TV Show Watchlist

A full-stack web application for tracking movies and TV shows to watch and rating the ones already seen. Built with **Django REST Framework (DRF)** and **Simple JWT** on the backend, and **React + Vite** with a modern cinema design system on the frontend.

---

## 🌟 Key Features

- **JWT Authentication Architecture**:
  - `TokenObtainPairView` & `TokenRefreshView` with access & refresh tokens.
  - Automatic token attachment via Axios request interceptor.
  - Transparent 401 token refresh & request replay via Axios response interceptor.
  - Strict user-scoping: all views scope queries to `owner=request.user`.
- **Watchlist Dashboard**:
  - **Two Primary Tabs**: **"To Watch"** (Unwatched) and **"Watched"** with real-time counts.
  - **Interactive 5-Star Rating Component**: Hover preview, click-to-rate with immediate PATCH updates to backend.
  - **Status Toggling**: One-click "Mark as Watched" or "Move to To-Watch".
  - **Search & Filtering**: Search by title, notes, or genre; filter by Movies vs TV Shows; sort by newest, rating, release year, or title.
  - **Rich Metadata**: Posters, genres, release year, personal reviews/notes, and quick poster preset picker.
  - **Statistics Bar**: Real-time summary of total items, watchlist count, watched count, and average rating.
  - **1-Click Demo Account**: Instantly log into the pre-seeded demo user (`demo` / `demo123`) or register a new account.

---

## 🏗️ Project Structure

```
movie-watchlist-app/
├── backend/
│   ├── server/                    # Django project configuration
│   │   ├── settings.py            # DRF, JWT, CORS, Postgres/SQLite settings
│   │   ├── urls.py                # JWT & API routes
│   │   └── wsgi.py
│   ├── watchlist/                 # Watchlist Django app
│   │   ├── models.py              # Media model with owner foreign key
│   │   ├── serializers.py         # Media, User, and Register serializers
│   │   ├── views.py               # MediaViewSet, CurrentUserView, RegisterView
│   │   ├── urls.py                # Media router
│   │   └── tests.py               # 9 passing unit tests
│   ├── init_demo.py               # Prepopulates demo user & sample titles
│   ├── build.sh                   # Production build script
│   ├── Dockerfile                 # Backend production container
│   ├── Procfile                   # Process file for Heroku/Railway
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js           # Axios instance with JWT refresh interceptors
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Global user & auth state
│   │   ├── components/
│   │   │   ├── StarRating.jsx     # Interactive 5-star rating widget
│   │   │   ├── MediaCard.jsx      # Card with actions, badges, rating
│   │   │   ├── MediaModal.jsx     # Add / edit media modal with poster presets
│   │   │   ├── Navbar.jsx         # Header navigation
│   │   │   ├── StatsBar.jsx       # Statistics summary
│   │   │   └── ProtectedRoute.jsx # Route guard
│   │   ├── pages/
│   │   │   ├── WatchlistDashboard.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── App.jsx
│   │   ├── index.css              # Cinema Obsidian design system
│   │   └── main.jsx
│   ├── Dockerfile                 # Frontend production container (Nginx)
│   ├── nginx.conf                 # Nginx SPA reverse proxy & router
│   ├── vercel.json                # Vercel SPA rewrite configuration
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml             # Full-stack Docker deployment
├── render.yaml                    # 1-Click Render Blueprint deployment
├── push_to_github.bat             # 1-Click Windows push to GitHub
├── push_to_github.ps1             # 1-Click PowerShell push to GitHub
├── run_backend.bat                # 1-Click local start backend
├── run_frontend.bat               # 1-Click local start frontend
├── start_all.bat                  # 1-Click local start both
└── README.md
```

---

## 🌐 Production Deployment Guide

### Option 1: 1-Click Render Blueprint (Recommended)
This repository includes a ready-to-use [`render.yaml`](file:///render.yaml) configuration that automatically provisions and connects both the **Django REST Backend** and the **React Vite Frontend**.

1. Push your code to your GitHub repository:
   - Double-click [`push_to_github.bat`](file:///push_to_github.bat) or run `git push origin main`.
2. Go to **[Render.com](https://render.com)** and log in.
3. Click **"New +"** &rarr; **"Blueprint"**.
4. Select your GitHub repository (`abnvx7/movie-watchlist-app`).
5. Render will automatically read `render.yaml`, configure the backend service, build the static frontend, and link the environment variables.
6. Click **"Apply"** — both the backend API and frontend will build and go live!

---

### Option 2: Deploy Frontend on Vercel & Backend on Render / Railway

#### Deploy Backend (Render / Railway):
1. **Root Directory**: `backend`
2. **Build Command**: `bash build.sh`
3. **Start Command**: `gunicorn server.wsgi --log-file -`
4. **Environment Variables**:
   - `DEBUG`: `False`
   - `SECRET_KEY`: *(Generate a secure random string)*
   - `DATABASE_URL`: *(Optional: connect your PostgreSQL database)*

#### Deploy Frontend (Vercel):
1. Go to **[Vercel](https://vercel.com)** &rarr; **"Add New Project"** &rarr; Select your GitHub repository.
2. Set **Root Directory** to `frontend`.
3. Framework Preset: **Vite**.
4. Add Environment Variable:
   - `VITE_API_URL`: `https://<your-backend-service>.onrender.com/api`
5. Click **"Deploy"**.

---

### Option 3: Deploy with Docker & Docker Compose
To run or deploy the entire stack using Docker:

```bash
# Build and run backend + frontend containers
docker-compose up --build -d
```
- Access Frontend at **[http://localhost](http://localhost)**
- Access Backend API at **[http://localhost:8000/api/](http://localhost:8000/api/)**

---

## 🚀 How to Run Locally

### Option 1: Using the Batch Scripts
1. Double-click `start_all.bat` in the project root to run both servers concurrently.
2. Open your browser at **[http://localhost:5173](http://localhost:5173)**.

### Option 2: Running in VS Code Terminals
1. **Terminal 1 (Backend)**:
   ```bash
   cd backend
   .\venv\Scripts\python.exe manage.py runserver 0.0.0.0:8000
   ```
2. **Terminal 2 (Frontend)**:
   ```bash
   cd frontend
   npm run dev
   ```

---

## 🔑 Demo Account Credentials
- **Username**: `demo`
- **Password**: `demo123`
*(Or click the "Instant Demo Account" button on the login screen!)*

---

## 🧪 Testing

Run backend unit tests:
```bash
cd backend
.\venv\Scripts\python.exe manage.py test watchlist
```
*(All 9 test suites pass: testing user registration, JWT generation, queryset scoping, rating update, status toggle, and cross-user data isolation).*