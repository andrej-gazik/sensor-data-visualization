import json

from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from api.models import Visualization, Room, File, SensorData
from api.serializers import VisualizationSerializer, RoomSerializer, FileSerializer, Sensor, SensorSerializer
from rest_framework import generics
from rest_framework import status
from rest_framework import mixins
import pandas as pd
import io
from .validation import validate_df


class VisualizationListCreateAPIView(generics.ListCreateAPIView):
    queryset = Visualization.objects.all()
    serializer_class = VisualizationSerializer

    def perform_create(self, serializer):
        name = serializer.validated_data.get('name')
        description = serializer.validated_data.get('description')
        owner = self.request.user
        if name is None:
            name = 'Unnamed Visualization'
        if self.request.user.is_active:
            serializer.save(owner=owner, name=name, description=description)
        else:
            serializer.save(owner=None, name=name, description=description)



visualization_create_api_view = VisualizationListCreateAPIView.as_view()


class RoomListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = RoomSerializer
    queryset = Room.objects.all()

    def list(self, request, pk):
        queryset = Room.objects.filter(visualization=pk)
        serializer = RoomSerializer(queryset, many=True)
        return Response(serializer.data)


    def post(self, request, format=None, *args, **kwargs):
        data = request.data
        if isinstance(data, list):
            serializer = self.get_serializer(data=request.data, many=True)
        visualization = get_object_or_404(Visualization, pk=kwargs.get('pk'))
        if serializer.is_valid():
            if visualization.status == 'blank':
                serializer.save(visualization=visualization)
                visualization.status = 'room'
                visualization.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response({'Detail': 'Room data already uploaded'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


room_create_api_view = RoomListCreateAPIView.as_view()


class VisualizationList(viewsets.ModelViewSet):
    # permission_class = []
    serializer_class = VisualizationSerializer

    # Define custom queryset
    def get_queryset(self):
        return Visualization.objects.all()


class UploadFileAPIView(generics.CreateAPIView):
    serializer_class = FileSerializer

    def post(self, request, *args, **kwargs):

        serializer_class = self.get_serializer(data=request.data)

        visualization = get_object_or_404(Visualization, pk=kwargs.get('pk'))

        # Add not
        #if Room.objects.filter(visualization=kwargs.get('pk')).exists():
         #   return Response('File was already uploaded', status=status.HTTP_400_BAD_REQUEST)
        if not visualization.status == 'room':
            return Response({'Detail: File already uploaded or upload criteria not met'}, status=status.HTTP_400_BAD_REQUEST)

        if 'file' not in request.FILES:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        elif not serializer_class.is_valid():
            return Response(serializer_class.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            res = handle_file_upload(request.FILES['file'], visualization)
            serializer_class.save(file=request.FILES['file'], visualization=visualization)
            return res

def handle_file_upload(file, visualization):
    # Use bulk create
    df = pd.read_csv(io.StringIO(file.read().decode('utf-8')), delimiter=',')
    df_validation = validate_df(df)
    print('Data validated')
    if df_validation is not None:
        # File is invalid
        return Response(df_validation, status=status.HTTP_400_BAD_REQUEST)
    else:
        # File is valid
        df_records = df.to_dict('records')
        insert_model_instances = [
            SensorData(
                visualization=visualization,
                sensor_name=record['sensor_id'],
                value=record['value'],
                measurement_time=record['time'],
            ) for record in df_records]
        print(insert_model_instances)
        SensorData.objects.bulk_create(insert_model_instances)


        sensors = df['sensor_id'].unique()

        insert_model_instances = [
            Sensor(
                visualization=visualization,
                name=sensor
            ) for sensor in sensors
        ]
        Sensor.objects.bulk_create(insert_model_instances)
        visualization.status = 'file'
        visualization.save()
        return Response(status=status.HTTP_201_CREATED)


upload_file_api_view = UploadFileAPIView.as_view()


class SensorListCreateAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = SensorSerializer
    queryset = Room.objects.all()

    def get(self, *args, **kwargs):
        queryset = Sensor.objects.filter(visualization=kwargs.get('pk'))
        serializer = SensorSerializer(queryset, many=True)
        return Response(serializer.data)


    def put(self, request, *args, **kwargs):
        data = request.data
        if isinstance(data, list):
            print('Iam here baby')

            serializer = self.get_serializer(data=request.data, many=True)
            # Validate ids

            # Get object

            # Pass objects to serializer

            # Serializer is valid

            # Serializer save

        else:
            serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


sensor_list_update_view = SensorListCreateAPIView.as_view()
