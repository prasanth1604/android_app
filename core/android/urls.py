from django.urls import path, include
from . import views
from .views import SignupView, LoginView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)

urlpatterns = [
    path('create/', views.CreateAppView.as_view(), name='create_app'),
    path('apps/', views.AppView.as_view(), name='app-list'),
]

