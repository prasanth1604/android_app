# core/urls.py
from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token
from . import views

urlpatterns = [
    path('auth/signup/', views.SignupView.as_view(), name='signup'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('users/me/', views.UserProfileView.as_view(), name='user-profile'),
    path('apps/', views.AppListView.as_view(), name='app-list'),
    path('admin/apps/', views.AdminAppListCreateView.as_view(), name='admin-app-list-create'),
    path('admin/apps/<int:pk>/', views.AdminAppRetrieveUpdateDestroyView.as_view(), name='admin-app-detail'),
    path('tasks/', views.UserTaskListView.as_view(), name='user-tasks'),
    path('tasks/create/', views.TaskCreateView.as_view(), name='task-create'), # NEW: Endpoint to create a task
    path('tasks/<int:pk>/screenshots/', views.TaskScreenshotUploadView.as_view(), name='task-screenshot-upload'),
    path('admin/tasks/', views.AdminTaskListView.as_view(), name='admin-task-list'),
    path('admin/tasks/<int:task_id>/approve/', views.ApproveTaskView.as_view(), name='approve-task'),
    path('admin/tasks/<int:task_id>/reject/', views.RejectTaskView.as_view(), name='reject-task'),
]