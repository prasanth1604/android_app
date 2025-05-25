from django.db import models

class App(models.Model):
    app_icon = models.ImageField(upload_to='img')
    app_name = models.CharField(max_length=100)
    points = models.IntegerField(default=1)
  
    