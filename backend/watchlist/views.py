from rest_framework import generics, viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.db.models import Q

from .models import Media
from .serializers import MediaSerializer, UserSerializer, UserRegisterSerializer


class RegisterView(generics.CreateAPIView):
    """
    Open endpoint for user registration.
    Returns the created user data along with JWT access and refresh tokens.
    """
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate tokens for instant login upon registration
        refresh = RefreshToken.for_user(user)
        user_data = UserSerializer(user).data

        return Response({
            'user': user_data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'message': 'User registered successfully.'
        }, status=status.HTTP_201_CREATED)


class CurrentUserView(APIView):
    """
    Protected endpoint to get current authenticated user profile.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class MediaViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Media items.
    Strictly scoped to the authenticated user via get_queryset() and perform_create().
    """
    serializer_class = MediaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Strict user scoping: users can ONLY see their own items
        queryset = Media.objects.filter(owner=self.request.user)

        # Query parameter filters
        status_param = self.request.query_params.get('status')
        if status_param in ['Watched', 'Unwatched']:
            queryset = queryset.filter(status=status_param)

        media_type = self.request.query_params.get('type')
        if media_type in ['Movie', 'TV']:
            queryset = queryset.filter(media_type=media_type)

        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(genre__icontains=search) |
                Q(notes__icontains=search)
            )

        ordering = self.request.query_params.get('ordering', '-created_at')
        valid_orderings = ['-created_at', 'created_at', '-rating', 'rating', 'title', '-release_year']
        if ordering in valid_orderings:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by('-created_at')

        return queryset

    def perform_create(self, serializer):
        # Automatically assign owner to current logged-in user
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=['patch'], url_path='rate')
    def update_rating(self, request, pk=None):
        """
        Quick endpoint to update rating for a media item.
        """
        media = self.get_object()
        rating = request.data.get('rating')
        if rating is None:
            return Response({'error': 'Rating is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            rating_val = int(rating)
            if rating_val < 0 or rating_val > 5:
                return Response({'error': 'Rating must be between 0 and 5'}, status=status.HTTP_400_BAD_REQUEST)
        except (ValueError, TypeError):
            return Response({'error': 'Invalid rating number'}, status=status.HTTP_400_BAD_REQUEST)

        media.rating = rating_val
        # Automatically mark as Watched if user rates >= 1 star and it was Unwatched
        if rating_val > 0 and media.status == Media.WatchStatus.UNWATCHED and request.data.get('auto_mark_watched', True):
            media.status = Media.WatchStatus.WATCHED

        media.save()
        serializer = self.get_serializer(media)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], url_path='toggle-status')
    def toggle_status(self, request, pk=None):
        """
        Toggle between 'Watched' and 'Unwatched'.
        """
        media = self.get_object()
        if media.status == Media.WatchStatus.UNWATCHED:
            media.status = Media.WatchStatus.WATCHED
        else:
            media.status = Media.WatchStatus.UNWATCHED
        media.save()
        serializer = self.get_serializer(media)
        return Response(serializer.data)


class SeedDataView(APIView):
    """
    Seeds curated sample movies and TV shows for the authenticated user.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        sample_items = [
            {
                "title": "Inception",
                "media_type": "Movie",
                "status": "Watched",
                "rating": 5,
                "genre": "Sci-Fi, Action",
                "release_year": 2010,
                "poster_url": "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80",
                "notes": "Mind-bending masterpiece by Christopher Nolan with incredible score."
            },
            {
                "title": "Stranger Things",
                "media_type": "TV",
                "status": "Watched",
                "rating": 4,
                "genre": "Drama, Fantasy, Horror",
                "release_year": 2016,
                "poster_url": "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&q=80",
                "notes": "Great 80s nostalgia and character dynamics."
            },
            {
                "title": "Dune: Part Two",
                "media_type": "Movie",
                "status": "Watched",
                "rating": 5,
                "genre": "Sci-Fi, Adventure",
                "release_year": 2024,
                "poster_url": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80",
                "notes": "Epic visuals and sound design. Denis Villeneuve delivered."
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
                "notes": "Cillian Murphy's performance is transcendent."
            },
            {
                "title": "The Bear",
                "media_type": "TV",
                "status": "Watched",
                "rating": 5,
                "genre": "Comedy, Drama",
                "release_year": 2022,
                "poster_url": "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80",
                "notes": "Yes Chef! Incredibly tense, emotional, and well paced."
            },
            {
                "title": "Interstellar",
                "media_type": "Movie",
                "status": "Unwatched",
                "rating": 0,
                "genre": "Sci-Fi, Adventure, Drama",
                "release_year": 2014,
                "poster_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80",
                "notes": "Planning a weekend rewatch on IMAX or 4K screen."
            },
            {
                "title": "Succession",
                "media_type": "TV",
                "status": "Unwatched",
                "rating": 0,
                "genre": "Drama",
                "release_year": 2018,
                "poster_url": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80",
                "notes": "Critically acclaimed drama about family corporate power."
            }
        ]

        created_count = 0
        for item in sample_items:
            # Avoid duplicate titles for the same user
            if not Media.objects.filter(owner=user, title=item['title']).exists():
                Media.objects.create(owner=user, **item)
                created_count += 1

        return Response({
            'message': f'Successfully seeded {created_count} media items.',
            'count': created_count
        })


class GitHubPushView(APIView):
    """
    Endpoint providing deployment & repository sync status and local Git push automation.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        import subprocess
        try:
            remotes = subprocess.check_output(['git', 'remote', '-v'], text=True, stderr=subprocess.STDOUT)
            status_output = subprocess.check_output(['git', 'status', '--short'], text=True, stderr=subprocess.STDOUT)
            branch = subprocess.check_output(['git', 'branch', '--show-current'], text=True, stderr=subprocess.STDOUT).strip()
            return Response({
                'branch': branch,
                'remotes': remotes,
                'modified_files': status_output.splitlines(),
                'git_available': True,
                'vercel_deploy_url': 'https://vercel.com/new',
            })
        except Exception as e:
            return Response({
                'git_available': False,
                'message': str(e),
                'vercel_deploy_url': 'https://vercel.com/new',
            })

    def post(self, request):
        import subprocess
        repo_url = request.data.get('repo_url')
        branch = request.data.get('branch', 'main')
        commit_msg = request.data.get('commit_message', 'feat: CineTrack Movie & TV Watchlist with Vercel Deploy')

        try:
            if repo_url:
                subprocess.run(['git', 'remote', 'remove', 'origin'], check=False, stderr=subprocess.DEVNULL)
                subprocess.run(['git', 'remote', 'add', 'origin', repo_url.strip()], check=True)

            subprocess.run(['git', 'add', '.'], check=True)
            subprocess.run(['git', 'commit', '-m', commit_msg], check=False)
            push_res = subprocess.run(['git', 'push', '-u', 'origin', branch], capture_output=True, text=True)

            if push_res.returncode == 0:
                return Response({
                    'success': True,
                    'message': 'Code pushed to GitHub successfully!',
                    'output': push_res.stdout,
                })
            else:
                return Response({
                    'success': False,
                    'error': push_res.stderr or push_res.stdout,
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e),
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
