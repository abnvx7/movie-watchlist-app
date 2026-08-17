from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MediaViewSet, CurrentUserView, SeedDataView, GitHubPushView

router = DefaultRouter()
router.register(r'media', MediaViewSet, basename='media')

urlpatterns = [
    path('auth/me/', CurrentUserView.as_view(), name='current-user'),
    path('seed/', SeedDataView.as_view(), name='seed-data'),
    path('github/push/', GitHubPushView.as_view(), name='github-push'),
    path('', include(router.urls)),
]
