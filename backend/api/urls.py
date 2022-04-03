from django.urls import path, include
from . import views
urlpatterns = [
    path('api-auth/', include('rest_framework.urls')),
    path('visualization/', views.visualization_create_api_view, name='visualization-list'),
    path('visualization/<int:pk>/room/', views.room_create_api_view, name='visualization-room-list'),
    path('visualization/<int:pk>/upload/', views.upload_file_api_view, name='file-upload'),
    path('visualization/<int:pk>/sensors/', views.sensor_list_update_view, name='sensor-update'),

]