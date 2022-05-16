import json
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import *


class UserTest(APITestCase):

    def setUp(self):
        self.email = 'jpueblo@example.com'
        self.username = 'jpueblo'
        self.password = 'password'
        self.user = User.objects.create_user(
            self.username, self.email, self.password)

        self.data = {
            'username': self.username,
            'password': self.password
        }
        self.visualization_name = "Test Visualization"
        self.visualization_description = "Visualization Description"


class LoginTest(UserTest):

    def setUp(self):
        pass
    def test_visualization_create(self):
        pass

    def test_visualization_list(self):
        response = self.client.get('/visualization/')


class VisualizationTest(APITestCase):
    def setUp(self):
        self.name_1 = "Test 1"
        self.desc_1 = "Test desc"

        self.name_2 = "Test 2"
        self.desc_2 = "Test 2"

        self.user = User.objects.create_user(
            'Test user', 'Test email', 'password')

        self.viz_1 = Visualization.objects.create(name=self.name_1, description=self.desc_1)
        self.viz_2 = Visualization.objects.create(name=self.name_2, description=self.desc_2, owner=self.user)

    def test_retrieve(self):
        res = self.client.get('/api/visualization/')
        data = [
            {
                'id': self.viz_1.id,
                'name': self.name_1,
                'description': self.desc_1,
                'status': 'blank',
                'owner': None
            },
            {
                'id': self.viz_2.id,
                'name': self.name_2,
                'description': self.desc_2,
                'status': 'blank',
                'owner': self.user.id,
            }
        ]
        self.assertEqual(res.data, data)
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_create(self):
        res = self.client.post('/api/visualization/', {'name': self.name_1, 'description': self.desc_1})
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_create_invalid_data(self):
        res = self.client.post('/api/visualization/', {'name': self.name_1})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

        res = self.client.post('/api/visualization/', {'description': self.desc_1})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)\

    def test_retrieve_stats(self):
        pass


class RoomTest(APITestCase):
    def setUp(self):
        self.viz = Visualization.objects.create(name='Test', description='Test desc')
        self.room_1 = Room.objects.create(name='Test room 1', width=100, height=100, visualization=self.viz)
        self.room_2 = Room.objects.create(name='Test room 2', width=100, height=100, visualization=self.viz)
        self.room_name = 'Test name'
        self.room_width = 100
        self.room_height = 100
        
    def test_retrieve_room_invalid_pk(self):
        url = reverse('visualization-room-list', kwargs={'pk': 100000})
        res = self.client.get(url)
        print(res.status_code)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data, [])

    def test_retrieve_room_valid_pk(self):
        url = reverse('visualization-room-list', kwargs={'pk': self.viz.id})
        res = self.client.get(url)
        data = [
            {
                'id': self.room_1.id,
                'width': self.room_1.width,
                'height': self.room_1.height,
                'name': self.room_1.name,
            },
            {
                'id': self.room_2.id,
                'width': self.room_2.width,
                'height': self.room_2.height,
                'name': self.room_2.name,
            }
        ]
        self.assertEqual(res.data, data)
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_create_room(self):
        url = reverse('visualization-room-list', kwargs={'pk': self.viz.id})
        res = self.client.post(url, {'name': self.room_name, 'width':self.room_width, 'height': self.room_height})
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_create_room_invalid_data(self):
        url = reverse('visualization-room-list', kwargs={'pk': self.viz.id})

        # Empty body
        res = self.client.post(url, {})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

        # Missing 1 param
        res = self.client.post(url, {'name': self.room_name, 'width': self.room_width})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

        # Missing 1 param
        res = self.client.post(url, {'name': self.room_name, 'height': self.room_height})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

        # Missing 1 param
        res = self.client.post(url, {'width': self.room_width, 'height': self.room_height})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

        # Missing 2 params
        res = self.client.post(url, {'height': self.room_height})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

        # Invalid dimensions
        res = self.client.post(url, {'name': self.room_name, 'width': -100, 'height': -100})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class DataTest(APITestCase):
    def setUp(self):
        self.viz = Visualization.objects.create(name='Test', description='Test desc')
        self.data_valid = b"""value,sensor_id,datetime
                                0.0,1,2020-12-17 13:43:03.000000
                                1.1,2,2020-12-17 13:44:09.000000
                                2.2,3,2020-12-17 13:45:54.000000
                                3.3,4,2020-12-17 13:48:07.000000
                                4.4,5,2020-12-17 13:49:13.000000
                                5.5,6,2020-12-17 13:50:46.000000
                                """

    def test_data_upload_valid(self):
        file = SimpleUploadedFile("test.csv", self.data_valid)
        url = reverse('file-upload', kwargs={'pk': self.viz.id})
        res = self.client.post(url, {'file': file})
        self.assertEqual(Sensor.objects.filter(visualization_id=self.viz.id).count(), 6)
        self.assertEqual(SensorData.objects.filter(visualization_id=self.viz.id).count(), 6)
        self.assertEqual(VisualizationStats.objects.filter(visualization_id=self.viz.id).count(), 1)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

class SensorTest(APITestCase):
    def setUp(self):
        self.viz = Visualization.objects.create(name='Test', description='Test desc')
        self.room = Room.objects.create(name='Test room 1', width=100, height=100, visualization=self.viz)
        self.sensor_1 = Sensor.objects.create(visualization=self.viz, room=self.room, name=1, x=None, y=None, alias=None)
        self.sensor_2 = Sensor.objects.create(visualization=self.viz, room=None, name=2, x=None, y=None, alias=None)

    def test_list_sensors(self):
        url = reverse('sensor-update', kwargs={'pk': self.viz.id})
        res = self.client.get(url)

        data = [
            {
                'id': self.sensor_1.id,
                'room': self.room.id,
                'name': self.sensor_1.name,
                'alias': None,
                'x': None,
                'y': None,
            },
            {
                'id': self.sensor_2.id,
                'room': None,
                'name': self.sensor_2.name,
                'alias': None,
                'x': None,
                'y': None,
            }

        ]
        self.assertEqual(res.data, data)
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_update_sensor_valid_data(self):
        url = reverse('sensor-update', kwargs={'pk': self.viz.id})

        put_data = {
            "id": self.sensor_2.id,
            "room": self.room.id,
            "x": 1,
            "alias": "Alias",
            "y": 1
        }

        res = self.client.put(url, put_data)

        # print(self.sensor_2.data)

        updated_sensor = Sensor.objects.get(pk=self.sensor_2.id)

        self.assertEqual(updated_sensor.room.id, self.room.id)
        self.assertEqual(updated_sensor.x, 1)
        self.assertEqual(updated_sensor.y, 1)
        self.assertEqual(updated_sensor.alias, "Alias")

    def test_update_sensors_valid_data(self):
        url = reverse('sensor-update', kwargs={'pk': self.viz.id})

        put_data = [
            {
                "id": self.sensor_1.id,
                "room": None,
                "x": 2,
                "alias": "Alias 1",
                "y": 2
            },
            {
                "id": self.sensor_2.id,
                "room": self.room.id,
                "x": 2,
                "alias": "Alias 2",
                "y": 2
            }
        ]

        res = self.client.put(url, put_data, format='json')

        updated_sensor_1 = Sensor.objects.get(pk=self.sensor_1.id)
        updated_sensor_2 = Sensor.objects.get(pk=self.sensor_2.id)

        self.assertEqual(updated_sensor_1.room, None)
        self.assertEqual(updated_sensor_1.x, 2)
        self.assertEqual(updated_sensor_1.y, 2)
        self.assertEqual(updated_sensor_1.alias, "Alias 1")

        self.assertEqual(updated_sensor_2.room.id, self.room.id)
        self.assertEqual(updated_sensor_2.x, 2)
        self.assertEqual(updated_sensor_2.y, 2)
        self.assertEqual(updated_sensor_2.alias, "Alias 2")

        self.assertEqual(res.status_code, status.HTTP_200_OK)



# class DataRetrieveTest(APITestCase):
