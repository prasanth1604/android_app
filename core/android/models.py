from django.db import models
from django.contrib.auth.models import User

class App(models.Model):
    name = models.CharField(max_length=100, unique=True)
    icon = models.ImageField(upload_to='app_icons/')
    points = models.IntegerField(default=0)
    
    def __str__(self):
        return self.name
    
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    is_admin = models.BooleanField(default=False)
    points_gained = models.IntegerField(default=0)
    tasks_completed = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.user.username}"
    
class ScreenShot(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    app = models.ForeignKey(App, on_delete=models.CASCADE)
    screenshot = models.ImageField(upload_to='screenshots/')
    is_approved = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} for {self.app.name}"