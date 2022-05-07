from django.urls import path, include, re_path
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from . import views

schema_view = get_schema_view(
    openapi.Info(
        title="Snippets API",
        default_version='v1',
        description="Test description",
        contact=openapi.Contact(email="gazikandrej0@gmail.com"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    path('api-auth/', include('rest_framework.urls')),
    path('visualization/', views.visualization_create_api_view, name='visualization-list'),
    path('visualization/<int:pk>/room/', views.room_create_api_view, name='visualization-room-list'),
    path('visualization/<int:pk>/room/<int:room>', views.room_delete_api_view, name='visualization-room-delete'),
    path('visualization/<int:pk>/upload/', views.upload_file_api_view, name='file-upload'),
    path('visualization/<int:pk>/sensors/', views.sensor_list_update_view, name='sensor-update'),
    path('visualization/<int:pk>/data/', views.sensor_data_list_view, name='sensor-data-list'),
    path('visualization/<int:pk>/mkt/', views.mkt_data_list_view, name='mkt-data-list'),


    # Documentation URLs
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
    # Optional UI:
    path('schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]