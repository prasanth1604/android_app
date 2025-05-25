from django.urls import path, include
from . import views

urlpatterns = [
    path('admin', views.AdminView.as_view(), name='admin'),
    path('available_apps', views.UserAvailableAppsView.as_view(), name='available_apps'),
    path('UserPointsView', views.UserPointsView.as_view(), name='user_points'),
    path('UserTaskView', views.UserTaskView.as_view(), name='user_tasks'),
]