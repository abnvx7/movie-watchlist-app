from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Media

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=4)
    email = serializers.EmailField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user

class MediaSerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Media
        fields = [
            'id',
            'title',
            'media_type',
            'status',
            'rating',
            'genre',
            'release_year',
            'poster_url',
            'notes',
            'owner',
            'owner_username',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'owner', 'owner_username', 'created_at', 'updated_at']

    def validate_rating(self, value):
        if value < 0 or value > 5:
            raise serializers.ValidationError("Rating must be an integer between 0 and 5.")
        return value
