from django.urls import path, include
from rest_framework import routers
from django.contrib import admin
from android import views
from android.views import LoginView, SignupView, AdminView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('android.urls')),
    path('login/', LoginView.as_view(), name='login'),
    path('signup/', SignupView.as_view(), name='signup'),
]
