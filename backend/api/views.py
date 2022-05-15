import io
import math
from collections import defaultdict

import pandas as pd
from pandas.errors import ParserError
from rest_framework import generics
from rest_framework import status
from rest_framework import viewsets
from rest_framework.exceptions import MethodNotAllowed
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response

from datetime import datetime
from api.models import Visualization, Room, SensorData, VisualizationStats
from api.serializers import (
    VisualizationSerializer,
    RoomSerializer,
    FileSerializer,
    Sensor,
    SensorSerializer,
    SensorDataSerializer, MKTSerializer, StatsSerializer,
)
from .queries import make_query, mkt
from .validation import validate_df


class VisualizationListCreateAPIView(generics.ListCreateAPIView):
    queryset = Visualization.objects.all()
    serializer_class = VisualizationSerializer

    def perform_create(self, serializer):
        name = serializer.validated_data.get("name")
        description = serializer.validated_data.get("description")
        owner = self.request.user
        if name is None:
            name = "Unnamed Visualization"
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
        else:
            serializer = self.get_serializer(data=request.data)

        visualization = get_object_or_404(Visualization, pk=kwargs.get("pk"))
        if serializer.is_valid():
            serializer.save(visualization=visualization)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


room_create_api_view = RoomListCreateAPIView.as_view()


class RoomDeleteAPIView(generics.DestroyAPIView):
    def delete(self, *args, **kwargs):
        visualization = get_object_or_404(Visualization, pk=kwargs.get("pk"))
        room = get_object_or_404(Room, pk=kwargs.get("room"))

        room.delete()

        return Response(status=status.HTTP_200_OK)


room_delete_api_view = RoomDeleteAPIView.as_view()


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

        visualization = get_object_or_404(Visualization, pk=kwargs.get("pk"))

        if visualization.status == "file":
            return Response(
                {"Detail: File already uploaded or upload criteria not met"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if "file" not in request.FILES:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        elif not serializer_class.is_valid():
            return Response(serializer_class.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            res = handle_file_upload(request.FILES["file"], visualization)
            serializer_class.save(
                file=request.FILES["file"], visualization=visualization
            )

            return res


def handle_file_upload(file, visualization):
    # Use bulk create
    try:
        df = pd.read_csv(io.StringIO(file.read().decode("utf-8")), delimiter=",")
    except Exception as e:
        return Response(status=status.HTTP_400_BAD_REQUEST)


    df_validation = validate_df(df)
    print("Data validated")
    if df_validation is not None:
        # File is invalid
        return Response(df_validation, status=status.HTTP_400_BAD_REQUEST)
    else:
        # File is valid

        chunks = list()
        chunk_size = 100000
        num_chunks = len(df) // chunk_size + 1
        for i in range(num_chunks):
            time = datetime.now()
            df_records = df[i * chunk_size:(i + 1) * chunk_size].to_dict("records")

            print(f"Chunk {i} records{(time - datetime.now()).total_seconds()}")
            insert_model_instances = [
                SensorData(
                    visualization=visualization,
                    sensor_name=record["sensor_id"],
                    value=record["value"],
                    measurement_time=record["time"],
                )
                for record in df_records
            ]
            time = datetime.now()
            SensorData.objects.bulk_create(insert_model_instances)
            print(f"Chunk {i} insert {(time - datetime.now()).total_seconds()}")

        sensors = df["sensor_id"].unique()

        insert_model_instances = [
            Sensor(visualization=visualization, name=sensor) for sensor in sensors
        ]
        Sensor.objects.bulk_create(insert_model_instances)

        min_temp = df["value"].min()
        max_temp = df["value"].max()
        min_date = df["time"].min()
        max_date = df["time"].max()

        stat = VisualizationStats(visualization=visualization, min_temp=min_temp, max_temp=max_temp, min_date=min_date,
                                  max_date=max_date)
        stat.save()

        visualization.status = "file"
        visualization.save()
        return Response(status=status.HTTP_201_CREATED)


upload_file_api_view = UploadFileAPIView.as_view()


class SensorListCreateAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = SensorSerializer
    queryset = Room.objects.all()

    def get(self, *args, **kwargs):
        queryset = Sensor.objects.filter(visualization=kwargs.get("pk"))
        serializer = SensorSerializer(queryset, many=True)
        return Response(serializer.data)

    def patch(self, request, *args, **kwargs):
        raise MethodNotAllowed(method="PATCH")

    def put(self, request, *args, **kwargs):
        data = request.data
        visualization = get_object_or_404(Visualization, pk=kwargs.get("pk"))

        if isinstance(data, list):
            errors = []
            for x in data:
                serializer = self.get_serializer(data=x)
                if not serializer.is_valid():
                    errors.append(serializer.errors)
            if len(errors) > 0:
                return Response(errors, status=status.HTTP_400_BAD_REQUEST)
            serializer = self.get_serializer(data=request.data, many=True)
        else:
            serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            validated_data = serializer.validated_data
            if isinstance(validated_data, list):
                for data in validated_data:
                    sensor = Sensor.objects.get(pk=data["id"])
                    sensor.room = data["room"]
                    sensor.alias = data["alias"]
                    sensor.x = data["x"]
                    sensor.y = data["y"]
                    sensor.save()
            else:
                sensor = Sensor.objects.get(pk=validated_data["id"])
                sensor.room = validated_data["room"]
                sensor.alias = validated_data["alias"]
                sensor.x = validated_data["x"]
                sensor.y = validated_data["y"]
                sensor.save()

            return Response(serializer.data, status=status.HTTP_200_OK)

        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


sensor_list_update_view = SensorListCreateAPIView.as_view()


class SensorDataListAPIView(generics.GenericAPIView):
    serializer_class = SensorDataSerializer

    def post(self, request, pk):
        print(request.data)
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            validated_data = serializer.validated_data
            data = make_query(
                pk,
                validated_data["aggregate"],
                validated_data["interval"],
                validated_data["gtd"],
                validated_data["ltd"],
            )

            # No data to return
            if len(data) == 0:
                return Response({"min_val": None, "max_val": None, "values": []}, status=status.HTTP_200_OK)

            result = defaultdict(list)

            min_val = -math.inf
            max_val = math.inf

            for date, sensor, value in data:
                result[str(date)].append((sensor, value))
                if value > min_val:
                    min_val = value
                if value < max_val:
                    max_val = value
            res = []

            for date, values in result.items():
                res.append({date: values})

            return Response({"min_val": min_val, "max_val": max_val, "values": res}, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, pk):

        data = {
            'gte': request.GET.get('gte', None),
            'lte': request.GET.get('lte', None),
            'aggregate': request.GET.get('aggregate', None),
            'interval': request.GET.get('interval', None)
        }

        serializer = self.get_serializer(data=data)

        if serializer.is_valid():
            validated_data = serializer.validated_data
            data = make_query(
                pk,
                validated_data["aggregate"],
                validated_data["interval"],
                validated_data["gte"],
                validated_data["lte"],
            )

            # No data to return
            if len(data) == 0:
                return Response({"min_val": None, "max_val": None, "values": []}, status=status.HTTP_200_OK)

            result = defaultdict(list)

            min_val = -math.inf
            max_val = math.inf

            for date, sensor, value in data:
                result[str(date)].append((sensor, value))
                if value > min_val:
                    min_val = value
                if value < max_val:
                    max_val = value
            res = []

            for date, values in result.items():
                res.append({date: values})

            return Response({"min_val": min_val, "max_val": max_val, "values": res}, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


sensor_data_list_view = SensorDataListAPIView.as_view()


class MKTDataListAPIView(generics.GenericAPIView):
    serializer_class = MKTSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update(
            {
                "gte": self.request.query_params.get('gte', None),
                "lte": self.request.query_params.get('lte', None),
                "interval": self.request.query_params.get('interval', None),

            }
        )
        return context

    def get(self, request, pk):

        data = {
            'gte': request.GET.get('gte', None),
            'lte': request.GET.get('lte', None),
            'interval': request.GET.get('interval', None)
        }

        serializer = self.get_serializer(data=data)

        if serializer.is_valid():
            validated_data = serializer.validated_data

            data = mkt(
                pk,
                validated_data["interval"],
                validated_data["gte"],
                validated_data["lte"]
            )

            result = defaultdict(list)

            res = []

            for date, sensor, value in data:
                result[str(date)].append({str(sensor): value})

            for date, values in result.items():
                res.append({date: values})

            return Response(res, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


mkt_data_list_view = MKTDataListAPIView.as_view()


class StatsDataAPIView(generics.GenericAPIView):

    def get(self, request, pk):
        visualization = get_object_or_404(Visualization, pk=pk)

        try:
            visualization_stats = VisualizationStats.objects.get(visualization=pk)
            stat_data = StatsSerializer(instance=visualization_stats).data
        except:
            visualization_stats = None
            stat_data = None

        res = VisualizationSerializer(instance=visualization).data
        res['stats'] = stat_data
        return Response(res, status=status.HTTP_200_OK)


stats_data_view = StatsDataAPIView.as_view()
