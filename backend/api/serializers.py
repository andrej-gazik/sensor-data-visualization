from rest_framework import serializers

from api.fields import RelatedFieldAlternative
from api.models import Visualization, Room, Sensor, File


class VisualizationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Visualization
        fields = ['id', 'name', 'description', 'status', 'owner']


class RoomSerializer(serializers.ModelSerializer):
    def __init__(self, *args, **kwargs):
        many = kwargs.pop('many', True)
        super(RoomSerializer, self).__init__(many=many, *args, **kwargs)

    class Meta:
        model = Room
        fields = ['x0', 'y0', 'x1', 'y1']
        read_only_fields = ['visualization']


class SensorSerializer(serializers.ModelSerializer):

    class Meta:
        model = Sensor
        fields = ['id', 'visualization', 'name', 'x', 'y']

class VisualizationField(serializers.Field):

    def to_representation(self, value):
        return VisualizationSerializer(value).data

    def to_internal_value(self, data):
        try:
            print(data)
            return Visualization.objects.get(pk=data)
        except (AttributeError, KeyError):
            pass


class FileSerializer(serializers.ModelSerializer):
    visualization = VisualizationSerializer(read_only=True)

    class Meta:
        model = File
        fields = ['visualization', 'file']



