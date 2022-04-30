from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class UsernameTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super(UsernameTokenObtainPairSerializer, cls).get_token(user)

        # Add custom claims
        token['user_name'] = user.username
        return token