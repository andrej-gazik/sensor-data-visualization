from rest_framework import serializers

from api.models import Visualization, Room, Sensor, File


class VisualizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visualization
        fields = ["id", "name", "description", "status", "owner"]


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ["id", "width", "name", "height"]
        read_only_fields = ["visualization"]
        extra_kwargs = {"name": {"required": True},
                        "width": {"required": True},
                        "height": {"required": True},
                        }


from django.core.exceptions import ValidationError


def validate_id_exists(value):
    if not Sensor.objects.filter(pk=value).exists():
        raise ValidationError(f'Invalid pk "{value}" - object does not exist.')


class SensorSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(min_value=1, validators=[validate_id_exists])
    x = serializers.IntegerField(min_value=0)
    y = serializers.IntegerField(min_value=0)

    class Meta:
        model = Sensor
        fields = ["id", "room", "name", "x", "y"]
        read_only_fields = ["visualization", "name"]
        extra_kwargs = {"room": {"required": True}}


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
        fields = ["visualization", "file"]


AGGREGATE_CHOICES = (
    ("min", "minimum"),
    ("max", "maximum"),
    ("avg", "average"),
    ("none", "none"),
)

INTERVAL_CHOICES = (
    ("month", "month"),
    ("week", "week"),
    ("day", "day"),
    ("hour", "hour"),
    ("minute", "minute"),
)


class SensorDataSerializer(serializers.Serializer):
    gtd = serializers.DateTimeField()
    ltd = serializers.DateTimeField()
    aggregate = serializers.ChoiceField(choices=AGGREGATE_CHOICES)
    interval = serializers.ChoiceField(choices=INTERVAL_CHOICES)
