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
│   ├── venv/                      # Python virtual environment
│   ├── server/                    # Django project configuration
│   │   ├── settings.py            # DRF, JWT, CORS settings
│   │   ├── urls.py                # JWT & API routes
│   │   └── wsgi.py
│   ├── watchlist/                 # Watchlist Django app
│   │   ├── models.py              # Media model with owner foreign key
│   │   ├── serializers.py         # Media, User, and Register serializers
│   │   ├── views.py               # MediaViewSet, CurrentUserView, RegisterView
│   │   ├── urls.py                # Media router
│   │   └── tests.py               # 9 passing unit tests
│   ├── init_demo.py               # Prepopulates demo user & sample titles
│   ├── db.sqlite3                 # SQLite database
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
│   ├── package.json
│   └── vite.config.js
├── run_backend.bat                # 1-Click start backend
├── run_frontend.bat               # 1-Click start frontend
├── start_all.bat                  # 1-Click start both
└── README.md
```

---

## 🚀 How to Run in VS Code

### Option 1: Using the Batch Scripts
1. Double-click `start_all.bat` in the project root to run both servers concurrently.
2. Open your browser at **[http://localhost:5173](http://localhost:5173)**.

### Option 2: Running in VS Code Terminals
1. Open the project folder `C:\Users\abnvk\.gemini\antigravity\scratch\movie-watchlist-app` in VS Code (`File > Open Folder...`).
2. **Terminal 1 (Backend)**:
   ```bash
   cd backend
   .\venv\Scripts\python.exe manage.py runserver 0.0.0.0:8000
   ```
3. **Terminal 2 (Frontend)**:
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
