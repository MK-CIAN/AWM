from rest_framework import serializers
from world.models import ChatRoom, Message, Event, Profile

# MessageSerializer to serialize the Message model
class MessageSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField() # Return username instead of ID
    user_id = serializers.IntegerField(source='user.id')
    timestamp = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S")  # Format timestamp

    class Meta:
        model = Message
        fields = ['user', 'user_id', 'content', 'timestamp']

# ChatRoomSerializer to serialize the ChatRoom model
class ChatRoomSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = ChatRoom
        fields = ['id', 'name', 'event', 'messages']

# EventSerializer to serialize the Event model
class EventSerializer(serializers.ModelSerializer):
    lat = serializers.FloatField(source='latitude')
    lon = serializers.FloatField(source='longitude')
    
    class Meta:
        model = Event
        fields = [
            'id',
            'name',
            'description',
            'location',
            'date',
            'image_url',
            'external_link',
            'lat',  # Include latitude
            'lon'   # Include longitude
        ]
        
# FriendLocationSerializer to serialize the location of a users friends
class FriendLocationSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    location = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['username', 'location', 'last_updated']

    def get_location(self, obj):
        if obj.location:
            return {
                "latitude": obj.location.y,
                "longitude": obj.location.x
            }
        return None