from .serializers import AppSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSignupSerializer, AppSerializer, LoginSerializer
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth import logout
from rest_framework.authtoken.models import Token
from .models import App
from rest_framework.authentication import TokenAuthentication
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework import status

class AdminView(APIView):
    
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def post(self, request):
        app_icon = request.FILES.get('app_icon')
        app_name = request.POST.get('app_name')
        points = request.POST.get('points')
        
        app = App.objects.create(
            app_icon=app_icon,
            app_name=app_name,
            points=points
        )
        app.save()
        return Response({"message": "App created successfully"}, status=status.HTTP_201_CREATED)
    
    def get(self, request):
        apps = App.objects.all()
        serializer = AppSerializer(apps, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class SignupView(APIView):
    """
    View for user signup.
    """
    def post(self, request):
        """
        Handle POST request for user signup.
        """
        data = request.data
        required_fields = ['username', 'password', 'confirm_password']
        if not all(field in data for field in required_fields):
            return Response({
                'error': 'Missing required fields'
            }, status=status.HTTP_400_BAD_REQUEST)
        # Check if passwords match
        if data['password'] != data['confirm_password']:
            return Response({
                'error': 'Passwords do not match'
            }, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username=data['username']).exists():
            return Response({
                'error': 'Username is already taken'
            }, status=status.HTTP_400_BAD_REQUEST)
        # Create a new user
        user = User.objects.create(
            username=data['username'],
            password=make_password(data['password'])
        )
        return Response({
            'message': 'User  created successfully',
            'user_id': user.id,
            'username': user.username
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        
        if user is not None:
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'username': user.username
            }, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)




class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        request.user.auth_token.delete()
        logout(request)
        return Response({"message": "Logged out successfully."}, status=status.HTTP_200_OK)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        return Response(user.data)
    
class UserTaskView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user_apps = App.objects.all()
        app_names = []
        for i in user_apps:
            app_names.append(i.app_name)
        return Response({
            'app_names': app_names
        })
        
class UserPointsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user_apps = App.objects.all()
        points_earned = 0
        app_points = []
        app_names = []
        for i in user_apps:
            points_earned += i.points
            app_points.append(i.points)
            app_names.append(i.app_name)
            
class UserAvailableAppsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user_apps = App.objects.all()
        serializer = AppSerializer(user_apps, many=True)
        return Response(serializer.data)
    
    

