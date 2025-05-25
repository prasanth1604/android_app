from django.contrib.auth import authenticate
from rest_framework import serializers
from .models import App
from django.contrib.auth.models import User

class AppSerializer(serializers.ModelSerializer):
    class Meta:
        model = App
        fields = ['id', 'app_icon', 'app_name', 'points']
        
        
class UserSignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username','password', 'conf_password']
        extra_kwargs = {'password': {'write_only': True}, 'conf_password': {'write_only': True}}
        
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            conf_password=validated_data['conf_password'],
        )
        if validated_data.get('conf_password') != validated_data['password']:
            raise serializers.ValidationError("Passwords do not match")
        return user
    
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=255)
    password = serializers.CharField(max_length=255, write_only=True)
    def validate(self, data):
        user = authenticate(username=data['username'], password=data['password'])
        if user is None:
            raise serializers.ValidationError('Invalid credentials')
        return user
    
    