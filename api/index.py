import os
import sys
import shutil
from pathlib import Path

# Add backend directory to sys.path so django settings and apps are imported correctly
BASE_DIR = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "server.settings")

# Handle SQLite on Vercel read-only filesystem
if os.environ.get("VERCEL") and not os.environ.get("DATABASE_URL"):
    tmp_db = Path("/tmp/db.sqlite3")
    source_db = BASE_DIR / "db.sqlite3"
    if not tmp_db.exists():
        if source_db.exists():
            try:
                shutil.copyfile(source_db, tmp_db)
            except Exception as e:
                print(f"Error copying template sqlite: {e}")
        else:
            try:
                import django
                django.setup()
                from django.core.management import call_command
                call_command("migrate", interactive=False)
                import init_demo
                init_demo.init_db()
            except Exception as e:
                print(f"Error initializing DB on startup: {e}")

from django.core.wsgi import get_wsgi_application

# Vercel serverless function entrypoint
application = get_wsgi_application()
app = application
