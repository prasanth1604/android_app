from django.db import models

class App(models.Model):
    app_icon = models.ImageField(upload_to='img')
    app_name = models.CharField(max_length=100, unique=True)
    points = models.IntegerField(default=1)
    
    def __str__(self):
        return self.app_name
    
class Request(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    app_name = models.ForeignKey(App, on_delete=models.CASCADE)
    screenshot = models.ImageField(upload_to='screenshots')
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected')
    ], default='pending')