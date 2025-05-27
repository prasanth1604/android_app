from rest_framework import serializers
from django.contrib.auth.models import User
from .models import App, UserProfile, Task

# Existing UserSerializer (for profile display/update, not for registration)
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name')
        read_only_fields = ('username',) # Username should not be changeable via profile update

# NEW: UserRegistrationSerializer for signup
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ('username', 'password', 'password_confirm', 'first_name', 'last_name', 'email') # Added email for completeness
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'email': {'required': False},
        }

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return data

    def create(self, validated_data):
        # Remove password_confirm as it's not a model field
        validated_data.pop('password_confirm')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            email=validated_data.get('email', ''),
        )
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True) # Use the simpler UserSerializer here

    class Meta:
        model = UserProfile
        fields = ('user', 'points_earned')
        read_only_fields = ('points_earned',)

class AppSerializer(serializers.ModelSerializer):
    class Meta:
        model = App
        fields = ('id', 'name', 'points')

class TaskSerializer(serializers.ModelSerializer):
    # This serializer might need to display user/app names, not just IDs
    user = serializers.StringRelatedField(read_only=True) # Displays username
    app = serializers.StringRelatedField(read_only=True)  # Displays app name

    class Meta:
        model = Task
        fields = ('id', 'user', 'app', 'screenshot', 'completed_at', 'is_approved')
        read_only_fields = ('completed_at', 'is_approved', 'user', 'app') # User and app are set on backend

class TaskScreenshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ('screenshot',)