# app/serializers.py

from rest_framework import serializers
from .models import App, UserProfile, ScreenShot
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile

class AppSerializer(serializers.ModelSerializer):
    class Meta:
        model = App
        fields = ('id', 'name', 'points')

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['user', 'points', 'tasks_completed']

class UserSignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        UserProfile.objects.create(user=user)
        return user
    
class ScreenShotSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScreenShot
        fields = ['user', 'app', 'screenshot', 'is_approved', 'uploaded_at']
        read_only_fields = ['is_approved', 'uploaded_at']