from django.contrib.auth.models import User
from django.db import models


class Visualization(models.Model):
    STATUS = (
        ("blank", "Blank"),
        ("room", "Room"),
        ("file", "File"),
        ("sensors", "Sensors"),
        ("available", "Available"),
    )

    name = models.CharField(max_length=50)
    description = models.CharField(max_length=200)
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    status = models.CharField(
        max_length=10,
        choices=STATUS,
        default="blank",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Room(models.Model):
    visualization = models.ForeignKey(Visualization, on_delete=models.CASCADE)
    name = models.CharField(max_length=20, null=True)
    width = models.PositiveIntegerField()
    height = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class Sensor(models.Model):
    visualization = models.ForeignKey(
        Visualization, on_delete=models.CASCADE, null=False
    )
    room = models.ForeignKey(Room, on_delete=models.CASCADE, null=True)
    name = models.PositiveSmallIntegerField()
    alias = models.CharField(max_length=20, null=True)
    x = models.PositiveIntegerField(null=True)
    y = models.PositiveIntegerField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class File(models.Model):
    visualization = models.ForeignKey(Visualization, on_delete=models.CASCADE)
    file = models.FileField(upload_to="data/")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class SensorData(models.Model):
    visualization = models.ForeignKey(Visualization, on_delete=models.CASCADE)
    sensor_name = models.PositiveIntegerField()
    value = models.FloatField(null=True)
    measurement_time = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class VisualizationStats(models.Model):
    visualization = models.ForeignKey(Visualization, on_delete=models.CASCADE)
    min_temp = models.FloatField()
    max_temp = models.FloatField()
    min_date = models.DateTimeField()
    max_date = models.DateTimeField()
