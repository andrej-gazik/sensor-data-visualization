from django.contrib import admin
from api.models import Visualization, Room, Sensor, SensorData, File

# Register your models here.
admin.site.register(Visualization)
admin.site.register(Room)
admin.site.register(Sensor)
admin.site.register(File)
admin.site.register(SensorData)


