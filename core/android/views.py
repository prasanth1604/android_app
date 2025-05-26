from .serializers import AppSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import AppSerializer, RequestSerializer
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth import logout
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from .models import App, Request

class AdminView(APIView):
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        if not request.user.is_superuser: 
            return Response({"error": "You do not have permission to create apps."}, status=status.HTTP_403_FORBIDDEN)
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
        if not request.user.is_superuser:
            return Response({"error": "You do not have permission to view apps."}, status=status.HTTP_403_FORBIDDEN)
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


class UserRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        app_name = request.data.get('app_name')
        screenshot = request.FILES.get('screenshot')

        if not app_name or not screenshot:
            return Response({'error': 'App name and screenshot are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            app = App.objects.get(app_name=app_name)
        except App.DoesNotExist:
            return Response({'error': 'App not found'}, status=status.HTTP_404_NOT_FOUND)

        Request.objects.create(
            user=request.user,
            app=app,
            screenshot=screenshot
        )

        return Response({'message': 'Request created successfully'}, status=status.HTTP_201_CREATED)

    

class AdminRequestView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    def get(self, request):
        if not request.user.is_superuser:
            return None
        requests = Request.objects.all()
        serializer = RequestSerializer(requests, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        if not request.user.is_superuser: 
            return Response({'error': 'Not authorized'}, status=403)

        request_id = request.data.get('request_id')
        new_status = request.data.get('status') # 'approved' or 'rejected'

        try:
            request_obj = Request.objects.get(id=request_id)
        except Request.DoesNotExist:
            return Response({'error': 'Request not found'}, status=404)

        request_obj.status = new_status
        request_obj.save()

        return Response({'message': 'Request status updated'}, status=200)
