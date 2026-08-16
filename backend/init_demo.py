import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')
django.setup()

from django.contrib.auth.models import User
from watchlist.models import Media

def init_db():
    # Create superuser / demo user if not exists
    user, created = User.objects.get_or_create(
        username='demo',
        defaults={'email': 'demo@watchlist.local'}
    )
    if created or not user.has_usable_password():
        user.set_password('demo123')
        user.is_staff = True
        user.is_superuser = True
        user.save()
        print(f"Created demo user: username='demo', password='demo123'")
    else:
        # Ensure password is set to demo123
        user.set_password('demo123')
        user.save()
        print("Updated demo user password to 'demo123'")

    # Prepopulate some initial media for demo user
    sample_items = [
        {
            "title": "Inception",
            "media_type": "Movie",
            "status": "Watched",
            "rating": 5,
            "genre": "Sci-Fi, Action",
            "release_year": 2010,
            "poster_url": "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80",
            "notes": "Mind-bending dream architecture. Hans Zimmer's iconic score."
        },
        {
            "title": "Stranger Things",
            "media_type": "TV",
            "status": "Watched",
            "rating": 4,
            "genre": "Drama, Fantasy, Horror",
            "release_year": 2016,
            "poster_url": "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&q=80",
            "notes": "Great 80s synth vibes and supernatural mystery."
        },
        {
            "title": "Dune: Part Two",
            "media_type": "Movie",
            "status": "Watched",
            "rating": 5,
            "genre": "Sci-Fi, Adventure",
            "release_year": 2024,
            "poster_url": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80",
            "notes": "Astonishing cinematography and worldbuilding on Arrakis."
        },
        {
            "title": "Severance",
            "media_type": "TV",
            "status": "Unwatched",
            "rating": 0,
            "genre": "Drama, Mystery, Sci-Fi",
            "release_year": 2022,
            "poster_url": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80",
            "notes": "Recommended by friends. High suspense workplace mystery."
        },
        {
            "title": "Oppenheimer",
            "media_type": "Movie",
            "status": "Watched",
            "rating": 5,
            "genre": "Biography, Drama, History",
            "release_year": 2023,
            "poster_url": "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&q=80",
            "notes": "Phenomenal pacing, intense audio design and lead performance."
        },
        {
            "title": "The Bear",
            "media_type": "TV",
            "status": "Watched",
            "rating": 5,
            "genre": "Comedy, Drama",
            "release_year": 2022,
            "poster_url": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80",
            "notes": "Yes Chef! Relentless energy, incredible acting, deep heart."
        },
        {
            "title": "Interstellar",
            "media_type": "Movie",
            "status": "Unwatched",
            "rating": 0,
            "genre": "Sci-Fi, Adventure",
            "release_year": 2014,
            "poster_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80",
            "notes": "Time dilation and gravitational waves. Must rewatch soon."
        },
        {
            "title": "Succession",
            "media_type": "TV",
            "status": "Unwatched",
            "rating": 0,
            "genre": "Drama",
            "release_year": 2018,
            "poster_url": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80",
            "notes": "Top tier writing and Shakespearean power struggles."
        }
    ]

    for item in sample_items:
        if not Media.objects.filter(owner=user, title=item['title']).exists():
            Media.objects.create(owner=user, **item)
    print(f"Demo media items verified. Total items for demo: {Media.objects.filter(owner=user).count()}")

if __name__ == '__main__':
    init_db()
