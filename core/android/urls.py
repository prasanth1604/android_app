from django.urls import path, include
from . import views

urlpatterns = [
    path('admin', views.AdminView.as_view(), name='admin'),
    path('available_apps', views.UserAvailableAppsView.as_view(), name='available_apps'),
    path('userpoints', views.UserPointsView.as_view(), name='user_points'),
    path('usertasks', views.UserTaskView.as_view(), name='user_tasks'),
    path('userprofile', views.UserProfileView.as_view(), name='user_profile'),
    
    path('userrequest', views.UserRequestView.as_view(), name='user_request'),
    path('adminrequest', views.AdminRequestView.as_view(), name='admin_request'),
]