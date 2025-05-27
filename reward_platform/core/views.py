from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from .models import App, UserProfile, Task
from .serializers import (
    UserSerializer,
    UserProfileSerializer,
    AppSerializer,
    TaskSerializer,
    TaskScreenshotSerializer,
    UserRegistrationSerializer, # NEW: Import the new serializer
)
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate

class SignupView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer # NEW: Use the registration serializer
    permission_classes = [permissions.AllowAny]

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({'token': token.key})
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.profile

class AppListView(generics.ListAPIView):
    queryset = App.objects.all()
    serializer_class = AppSerializer
    permission_classes = [permissions.IsAuthenticated]

class AdminAppListCreateView(generics.ListCreateAPIView):
    queryset = App.objects.all()
    serializer_class = AppSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminAppRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = App.objects.all()
    serializer_class = AppSerializer
    permission_classes = [permissions.IsAdminUser]

class UserTaskListView(generics.ListAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.tasks.all()

# NEW: Task creation endpoint (when a user "starts" a task, before screenshot)
class TaskCreateView(generics.CreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Ensure the task is created for the authenticated user
        app_id = self.request.data.get('app') # Assuming 'app' (ID) is sent in the request body
        app = get_object_or_404(App, pk=app_id)
        serializer.save(user=self.request.user, app=app)


class TaskScreenshotUploadView(generics.UpdateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskScreenshotSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Ensure users can only upload screenshots for their own tasks
        return self.request.user.tasks.all()


class AdminTaskListView(generics.ListAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAdminUser]

class ApproveTaskView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, task_id):
        try:
            task = Task.objects.get(pk=task_id)
            if not task.is_approved:
                task.is_approved = True
                task.save()
                user_profile = task.user.profile
                user_profile.points_earned += task.app.points
                user_profile.save()
                return Response({'message': 'Task approved and points updated.'})
            else:
                return Response({'message': 'Task already approved.'})
        except Task.DoesNotExist:
            return Response({'error': 'Task not found.'}, status=status.HTTP_404_NOT_FOUND)

class RejectTaskView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, task_id):
        try:
            task = Task.objects.get(pk=task_id)
            if task.is_approved:
                return Response({'message': 'Cannot reject an already approved task.'})
            task.delete() # Or mark as rejected if you want to keep a log
            return Response({'message': 'Task rejected.'})
        except Task.DoesNotExist:
            return Response({'error': 'Task not found.'}, status=status.HTTP_404_NOT_FOUND)