from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

class Media(models.Model):
    class MediaType(models.TextChoices):
        MOVIE = 'Movie', 'Movie'
        TV = 'TV', 'TV Show'

    class WatchStatus(models.TextChoices):
        UNWATCHED = 'Unwatched', 'To Watch'
        WATCHED = 'Watched', 'Watched'

    title = models.CharField(max_length=255)
    media_type = models.CharField(
        max_length=10,
        choices=MediaType.choices,
        default=MediaType.MOVIE
    )
    status = models.CharField(
        max_length=15,
        choices=WatchStatus.choices,
        default=WatchStatus.UNWATCHED
    )
    rating = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        help_text="Rating from 1 to 5 stars, 0 indicates unrated"
    )
    genre = models.CharField(max_length=100, blank=True, default='')
    release_year = models.IntegerField(null=True, blank=True)
    poster_url = models.URLField(max_length=1000, blank=True, default='')
    notes = models.TextField(blank=True, default='')
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='media_items'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Media Item'
        verbose_name_plural = 'Media Items'

    def __str__(self):
        return f"{self.title} ({self.media_type}) - {self.status} [{self.owner.username}]"
