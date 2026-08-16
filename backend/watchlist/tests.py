from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import Media

class MediaWatchlistTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create test users
        self.user1 = User.objects.create_user(username='alice', password='password123', email='alice@test.com')
        self.user2 = User.objects.create_user(username='bob', password='password123', email='bob@test.com')
        
        # Create media for user1
        self.media1 = Media.objects.create(
            title='Inception',
            media_type='Movie',
            status='Watched',
            rating=5,
            owner=self.user1
        )
        self.media2 = Media.objects.create(
            title='Severance',
            media_type='TV',
            status='Unwatched',
            rating=0,
            owner=self.user1
        )
        
        # Create media for user2
        self.media3 = Media.objects.create(
            title='Bob Movie',
            media_type='Movie',
            status='Unwatched',
            rating=0,
            owner=self.user2
        )

    def test_user_registration(self):
        response = self.client.post('/api/auth/register/', {
            'username': 'charlie',
            'password': 'password123',
            'email': 'charlie@test.com'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['username'], 'charlie')

    def test_jwt_token_obtain(self):
        response = self.client.post('/api/token/', {
            'username': 'alice',
            'password': 'password123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_unauthenticated_media_access_denied(self):
        response = self.client.get('/api/media/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_user_sees_only_own_media(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.get('/api/media/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Alice should see 2 items, and should NOT see Bob's item
        titles = [item['title'] for item in response.data]
        self.assertIn('Inception', titles)
        self.assertIn('Severance', titles)
        self.assertNotIn('Bob Movie', titles)
        self.assertEqual(len(response.data), 2)

    def test_filter_by_status(self):
        self.client.force_authenticate(user=self.user1)
        
        # Filter Unwatched ("To Watch")
        res_unwatched = self.client.get('/api/media/?status=Unwatched')
        self.assertEqual(res_unwatched.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_unwatched.data), 1)
        self.assertEqual(res_unwatched.data[0]['title'], 'Severance')
        
        # Filter Watched
        res_watched = self.client.get('/api/media/?status=Watched')
        self.assertEqual(res_watched.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_watched.data), 1)
        self.assertEqual(res_watched.data[0]['title'], 'Inception')

    def test_create_media_item(self):
        self.client.force_authenticate(user=self.user1)
        data = {
            'title': 'Dune: Part Two',
            'media_type': 'Movie',
            'status': 'Unwatched',
            'rating': 0,
            'genre': 'Sci-Fi'
        }
        response = self.client.post('/api/media/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Dune: Part Two')
        self.assertEqual(response.data['owner_username'], 'alice')

    def test_update_rating_endpoint(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.patch(f'/api/media/{self.media2.id}/rate/', {'rating': 4})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['rating'], 4)
        # Verify auto-mark watched when rated
        self.assertEqual(response.data['status'], 'Watched')

    def test_toggle_status_endpoint(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.patch(f'/api/media/{self.media2.id}/toggle-status/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'Watched')
        
        # Toggle back
        response2 = self.client.patch(f'/api/media/{self.media2.id}/toggle-status/')
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        self.assertEqual(response2.data['status'], 'Unwatched')

    def test_user_cannot_access_or_edit_other_user_media(self):
        # Alice tries to update Bob's movie
        self.client.force_authenticate(user=self.user1)
        response = self.client.patch(f'/api/media/{self.media3.id}/rate/', {'rating': 5})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
