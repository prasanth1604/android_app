from .models import App, UserProfile, ScreenShot
from .serializers import AppSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSignupSerializer, AppSerializer, ScreenShotSerializer
from rest_framework_simplejwt.tokens import RefreshToken, TokenError

class SignupView(APIView):
    def post(self, request):
        serializer = UserSignupSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)
        if user is not None:
            return Response({"message": "Login successful", "user_id": user.id}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        
class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logged out successfully."}, status=status.HTTP_205_RESET_CONTENT)
        except TokenError:
            return Response({"error": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)
        except KeyError:
            return Response({"error": "Refresh token required."}, status=status.HTTP_400_BAD_REQUEST)

class CreateAppView(APIView):
    def post(self, request):
        if not request.user.is_authenticated:
            return Response({"error": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)

        if not request.user.is_staff:
            return Response({"error": "You do not have permission to perform this action."}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = AppSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AppView(APIView):
    
    def get(self, request):
        
        queryset = App.objects.all()
        serializer = AppSerializer(queryset, many=True)
        return Response(serializer.data)
    

class SubmitScreenshotView(APIView):
    def post(self, request, app_id):
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            app = App.objects.get(id=app_id)
        except App.DoesNotExist:
            return Response({"error": "App not found"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data.copy()
        data['user'] = request.user.id
        data['app'] = app.id
        serializer = ScreenShotSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Screenshot submitted, waiting for approval."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ApproveScreenshotView(APIView):
    def post(self, request, submission_id):
        if not request.user.is_staff:
            return Response({"error": "Admins only"}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            submission = ScreenShot.objects.get(id=submission_id)
        except ScreenShot.DoesNotExist:
            return Response({"error": "Submission not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if submission.is_approved:
            return Response({"message": "Already approved"}, status=status.HTTP_400_BAD_REQUEST)

        submission.is_approved = True
        submission.save()

        # Update user's profile
        profile = UserProfile.objects.get(user=submission.user)
        profile.points_gained += submission.app.points
        profile.tasks_completed += 1
        profile.save()

        return Response({"message": "Approved, points awarded."})
