from django.db import models
from django.contrib.auth.models import User


class Visualization(models.Model):

    STATUS = (
        ('blank', 'Blank'),
        ('room', 'Room'),
        ('file', 'File'),
        ('sensors', 'Sensors'),
        ('available', 'Available'),
    )

    name = models.CharField(max_length=50)
    description = models.CharField(max_length=200)
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    status = models.CharField(
        max_length=10,
        choices=STATUS,
        default='blank',
        )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Room(models.Model):
    visualization = models.ForeignKey(Visualization, on_delete=models.CASCADE)
    x0 = models.PositiveIntegerField()
    y0 = models.PositiveIntegerField()
    x1 = models.PositiveIntegerField()
    y1 = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Sensor(models.Model):
    visualization = models.ForeignKey(Visualization, on_delete=models.CASCADE, null=False)
    name = models.PositiveSmallIntegerField()
    x = models.PositiveIntegerField(null=True)
    y = models.PositiveIntegerField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class File(models.Model):
    visualization = models.ForeignKey(Visualization, on_delete=models.CASCADE)
    file = models.FileField(upload_to='data/')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class SensorData(models.Model):
    visualization = models.ForeignKey(Visualization, on_delete=models.CASCADE)
    sensor_name = models.PositiveIntegerField()
    value = models.FloatField(null=True)
    measurement_time = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

