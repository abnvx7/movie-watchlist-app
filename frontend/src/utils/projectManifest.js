/**
 * CineTrack Project Files Manifest
 * Bundles the full-stack CineTrack repository files for client-side direct pushing to GitHub.
 */

export const PROJECT_METADATA = {
  name: 'cinetrack-movie-watchlist',
  title: 'CineTrack - Full-Stack Movie & TV Show Watchlist',
  description: 'Full-stack Cinema Watchlist app with Django REST Framework, Simple JWT, React 19 + Vite, and 1-Click Vercel & Render deployment.',
  version: '1.0.0',
  defaultBranch: 'main',
};

export const getProjectFiles = () => [
  {
    path: 'README.md',
    category: 'Documentation',
    content: `# CineTrack &bull; Movie & TV Show Watchlist

A full-stack web application for tracking movies and TV shows to watch and rating the ones already seen. Built with **Django REST Framework (DRF)** and **Simple JWT** on the backend, and **React + Vite** with a modern cinema design system on the frontend.

---

## 🌟 Key Features

- **JWT Authentication Architecture**:
  - \`TokenObtainPairView\` & \`TokenRefreshView\` with access & refresh tokens.
  - Automatic token attachment via Axios request interceptor.
  - Transparent 401 token refresh & request replay via Axios response interceptor.
  - Strict user-scoping: all views scope queries to \`owner=request.user\`.
- **Watchlist Dashboard**:
  - **Two Primary Tabs**: **"To Watch"** (Unwatched) and **"Watched"** with real-time counts.
  - **Interactive 5-Star Rating Component**: Hover preview, click-to-rate with immediate updates.
  - **Status Toggling**: One-click "Mark as Watched" or "Move to To-Watch".
  - **Search & Filtering**: Search by title, notes, or genre; filter by Movies vs TV Shows; sort by newest, rating, release year, or title.
  - **Rich Metadata**: Posters, genres, release year, personal reviews/notes, and quick poster preset picker.
  - **Statistics Bar**: Real-time summary of total items, watchlist count, watched count, and average rating.
  - **Direct GitHub Push & Vercel Auto-Deploy**: Built-in browser tool to sync to GitHub and deploy with Vercel.

---

## 🌐 Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Import your GitHub repository in **[Vercel](https://vercel.com)**.
2. Root Directory: \`frontend\` (or root with provided \`vercel.json\`).
3. Set environment variable: \`VITE_API_URL\` = \`https://<your-backend-service>.onrender.com/api\`
4. Click **Deploy**!

---

## 🚀 How to Run Locally

### Start Backend & Frontend:
\`\`\`bash
# Backend (Django)
cd backend
python manage.py runserver 0.0.0.0:8000

# Frontend (React + Vite)
cd frontend
npm install
npm run dev
\`\`\`
Open browser at: **http://localhost:5173**
`,
  },
  {
    path: 'vercel.json',
    category: 'Deployment',
    content: JSON.stringify(
      {
        buildCommand: 'npm --prefix frontend install && npm --prefix frontend run build',
        outputDirectory: 'frontend/dist',
        framework: 'vite',
        rewrites: [
          {
            source: '/(.*)',
            destination: '/index.html',
          },
        ],
      },
      null,
      2
    ),
  },
  {
    path: 'package.json',
    category: 'Config',
    content: JSON.stringify(
      {
        name: 'cinetrack-workspace',
        private: true,
        scripts: {
          build: 'npm --prefix frontend install && npm --prefix frontend run build',
          'install:frontend': 'npm --prefix frontend install',
        },
      },
      null,
      2
    ),
  },
  {
    path: '.gitignore',
    category: 'Config',
    content: `node_modules/
dist/
dist-ssr/
*.local
.env
.env.*.local
.DS_Store
Thumbs.db
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
env/
venv/
ENV/
*.sqlite3
.vscode/
.idea/
`,
  },
  {
    path: 'docker-compose.yml',
    category: 'Deployment',
    content: `services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DEBUG=True
      - SECRET_KEY=django-insecure-docker-secret-key-development
    volumes:
      - ./backend:/app

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
`,
  },
  {
    path: 'render.yaml',
    category: 'Deployment',
    content: `services:
  - type: web
    name: cinetrack-backend
    env: python
    buildCommand: "cd backend && pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput && python init_demo.py"
    startCommand: "cd backend && gunicorn server.wsgi:application --bind 0.0.0.0:$PORT"
    envVars:
      - key: DEBUG
        value: "False"
      - key: SECRET_KEY
        generateValue: true
      - key: PYTHON_VERSION
        value: "3.11.9"

  - type: web
    name: cinetrack-frontend
    env: static
    buildCommand: "cd frontend && npm install && npm run build"
    staticPublishPath: "./frontend/dist"
    routes:
      - type: rewrite
        source: "/*"
        destination: "/index.html"
    envVars:
      - key: VITE_API_URL
        fromService:
          type: web
          name: cinetrack-backend
          property: url
`,
  },
  {
    path: 'backend/requirements.txt',
    category: 'Backend',
    content: `django>=5.0,<6.0
djangorestframework>=3.14.0,<4.0.0
djangorestframework-simplejwt>=5.3.0,<6.0.0
django-cors-headers>=4.3.0,<5.0.0
gunicorn>=21.2.0,<22.0.0
whitenoise>=6.6.0,<7.0.0
dj-database-url>=2.1.0,<3.0.0
psycopg2-binary>=2.9.9,<3.0.0
`,
  },
  {
    path: 'backend/Dockerfile',
    category: 'Backend',
    content: `FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN python manage.py migrate
RUN python manage.py collectstatic --noinput || true
RUN python init_demo.py || true
EXPOSE 8000
CMD ["gunicorn", "server.wsgi:application", "--bind", "0.0.0.0:8000"]
`,
  },
  {
    path: 'backend/server/settings.py',
    category: 'Backend',
    content: `import os
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get(
    'SECRET_KEY', 
    'django-insecure-movie-watchlist-secret-key-development'
)

DEBUG = os.environ.get('DEBUG', 'True').lower() in ['true', '1', 't']
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'whitenoise.runserver_nostatic',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'watchlist',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'server.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'server.wsgi.application'

DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    try:
        import dj_database_url
        DATABASES = {
            'default': dj_database_url.config(
                default=DATABASE_URL,
                conn_max_age=600,
                conn_health_checks=True,
            )
        }
    except ImportError:
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': BASE_DIR / 'db.sqlite3',
            }
        }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,
    'UPDATE_LAST_LOGIN': False,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
`,
  },
  {
    path: 'backend/server/urls.py',
    category: 'Backend',
    content: `from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from watchlist.views import RegisterView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/register/', RegisterView.as_view(), name='auth_register'),
    path('api/', include('watchlist.urls')),
]
`,
  },
  {
    path: 'backend/watchlist/models.py',
    category: 'Backend',
    content: `from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

class Media(models.Model):
    class MediaType(models.TextChoices):
        MOVIE = 'Movie', 'Movie'
        TV = 'TV', 'TV Show'

    class WatchStatus(models.TextChoices):
        WATCHED = 'Watched', 'Watched'
        UNWATCHED = 'Unwatched', 'Unwatched'

    title = models.CharField(max_length=255)
    media_type = models.CharField(max_length=10, choices=MediaType.choices, default=MediaType.MOVIE)
    status = models.CharField(max_length=15, choices=WatchStatus.choices, default=WatchStatus.UNWATCHED)
    rating = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(5)])
    genre = models.CharField(max_length=100, blank=True, null=True)
    release_year = models.IntegerField(blank=True, null=True)
    poster_url = models.URLField(max_length=500, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='media_items')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.media_type}) - {self.status}"
`,
  },
  {
    path: 'backend/watchlist/serializers.py',
    category: 'Backend',
    content: `from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Media

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=6)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user

class MediaSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Media
        fields = [
            'id', 'title', 'media_type', 'status', 'rating', 
            'genre', 'release_year', 'poster_url', 'notes', 
            'owner', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']
`,
  },
  {
    path: 'frontend/package.json',
    category: 'Frontend',
    content: JSON.stringify(
      {
        name: 'frontend',
        private: true,
        version: '1.0.0',
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'vite build',
          lint: 'oxlint',
          preview: 'vite preview',
        },
        dependencies: {
          axios: '^1.19.0',
          'lucide-react': '^1.31.0',
          react: '^19.2.8',
          'react-dom': '^19.2.8',
        },
        devDependencies: {
          '@types/react': '^19.2.17',
          '@types/react-dom': '^19.2.3',
          '@vitejs/plugin-react': '^6.0.4',
          oxlint: '^1.75.0',
          vite: '^8.2.0',
        },
      },
      null,
      2
    ),
  },
  {
    path: 'frontend/vercel.json',
    category: 'Frontend',
    content: JSON.stringify(
      {
        rewrites: [
          {
            source: '/(.*)',
            destination: '/index.html',
          },
        ],
      },
      null,
      2
    ),
  },
  {
    path: 'frontend/vite.config.js',
    category: 'Frontend',
    content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
`,
  },
  {
    path: 'frontend/index.html',
    category: 'Frontend',
    content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CineTrack &bull; Movie & TV Show Watchlist</title>
    <!-- Google Fonts: Outfit & Plus Jakarta Sans -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`,
  },
];
