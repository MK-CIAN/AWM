from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.contrib.gis.geos import Point
from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from knox.auth import TokenAuthentication
from knox.models import AuthToken
from world.models import AudiotourPoints, Profile, Event, ChatRoom, Message, SavedEvent, FriendRequest, Friendship
from .serializers import ChatRoomSerializer, MessageSerializer, EventSerializer, FriendLocationSerializer

# Login API view
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Knox-based API endpoint for user login.
    """
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)
    if user:
        token = AuthToken.objects.create(user)[1]
        return Response({"success": "Logged in successfully", "token": token}, status=200)
    return Response({"error": "Invalid username or password"}, status=401)

# Logout API view
@api_view(['POST'])
def logout_view(request):
    """
    Knox-based API endpoint for user logout.
    """
    request._auth.delete()  # Deleting the token used for authentication
    return Response({"success": "Logged out successfully"}, status=200)

# Register API view
@api_view(['POST'])
@permission_classes([AllowAny])
def register_api(request):
    data = request.data
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    confirm_password = data.get('confirm_password')

    if not password or not confirm_password:
        return Response({"error": "Password and confirmation are required"}, status=400)

    if password != confirm_password:
        return Response({"error": "Passwords do not match"}, status=400)

    try:
        validate_password(password)  # Validating the password
        user = User.objects.create_user(username=username, email=email, password=password)
        user.save()
        return Response({"success": "User registered successfully!"}, status=201)
    except ValidationError as e:
        return Response({"error": e.messages}, status=400)
    except Exception as e:
        return Response({"error": str(e)}, status=400)


# User info API view
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_info(request):
    user = request.user
    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
    }, status=200)

# Update user location API view
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_location_api(request):
    latitude = request.data.get("latitude")
    longitude = request.data.get("longitude")

    if latitude and longitude:
        profile, _ = Profile.objects.get_or_create(user=request.user)
        profile.location = Point(float(longitude), float(latitude))
        profile.save()
        return Response({"success": True}, status=200)
    return Response({"success": False, "error": "Invalid request"}, status=400)

# Fetch events API view
@api_view(['GET'])
@permission_classes([AllowAny])
def fetch_events_api(request):
    category = request.GET.get('category', 'all')
    if category == 'all':
        events = Event.objects.all()
    else:
        events = Event.objects.filter(category=category)

    data = [
        {
            "id": event.id,
            "name": event.name,
            "description": event.description,
            "lat": event.latitude,
            "lon": event.longitude,
            "location": event.location,
            "date": event.date,
            "category": event.category,
            "external_link": event.external_link,
            "image_url": event.image_url
        }
        for event in events
    ]
    return Response(data, status=200)

# Get or create chatroom API view
@api_view(['GET'])
@permission_classes([AllowAny])
def get_chatroom(request, event_id):
    chatroom, created = ChatRoom.objects.get_or_create(
        event_id=event_id, 
        defaults={"name": f"Chat for Event {event_id}"}
    )
    serializer = ChatRoomSerializer(chatroom)
    return Response(serializer.data, status=200)

# Get chat messages for an event API view
@api_view(['GET'])
@permission_classes([AllowAny])
def get_chat_messages(request, event_id):
    chatroom = get_object_or_404(ChatRoom, event_id=event_id)
    messages = chatroom.messages.order_by('timestamp')  # Fetch in ascending order
    serializer = MessageSerializer(messages, many=True)
    return Response(serializer.data, status=200)

# Post a message to event chat API view
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def post_message(request, event_id):
    chatroom = get_object_or_404(ChatRoom, event_id=event_id)
    content = request.data.get('content')

    if not content:
        return Response({"error": "Message cannot be empty"}, status=400)

    message = Message.objects.create(
        chatroom=chatroom,
        user=request.user,
        content=content
    )
    serializer = MessageSerializer(message)
    return Response(serializer.data, status=201)

# Fetch specific event detail API view
@api_view(['GET'])
@permission_classes([AllowAny])
def fetch_event_detail(request, event_id):
    event = get_object_or_404(Event, pk=event_id)

    # Check for missing coordinates
    if event.latitude is None or event.longitude is None:
        return Response(
            {"error": "Event coordinates are missing."},
            status=400
        )

    serializer = EventSerializer(event)
    return Response(serializer.data, status=200)

# Save Event API
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_event(request, event_id):
    event = get_object_or_404(Event, pk=event_id)
    saved_event, created = SavedEvent.objects.get_or_create(
        user=request.user,
        event=event
    )
    if created:
        return Response({"message": "Event saved successfully!"}, status=201)
    return Response({"message": "Event already saved."}, status=200)


# Get All Saved Events API
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_saved_events(request):
    saved_events = SavedEvent.objects.filter(user=request.user).select_related('event')
    events = [
        {
            "id": e.event.id,
            "name": e.event.name,
            "image_url": e.event.image_url,
            "location": e.event.location,
            "lat": e.event.latitude,
            "lon": e.event.longitude,
            "date": e.event.date,
        } 
        for e in saved_events
    ]
    return Response(events, status=200)

# Send friend request API view
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_friend_request(request):
    to_user_id = request.data.get('to_user_id')
    print("Incoming user ID:", to_user_id)  # Log the user ID being sent
    
    to_user = get_object_or_404(User, id=to_user_id)
    print(f"User found: {to_user}")

    if FriendRequest.objects.filter(from_user=request.user, to_user=to_user, status='pending').exists():
        return Response({"error": "Friend request already sent"}, status=400)
    
    FriendRequest.objects.create(from_user=request.user, to_user=to_user, status='pending')
    return Response({"message": "Friend request sent"}, status=201)

# Get pending friend requests API view
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_pending_requests(request):
    pending_requests = FriendRequest.objects.filter(to_user=request.user, status='pending')
    data = [
        {
            "id": req.id,
            "from_user": req.from_user.username,
            "from_user_id": req.from_user.id,
            "timestamp": req.timestamp
        } 
        for req in pending_requests
    ]
    return Response(data, status=200)

# Accept or deny friend requests API view
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def respond_to_request(request):
    request_id = request.data.get('request_id')
    action = request.data.get('action')
    friend_request = get_object_or_404(FriendRequest, id=request_id, to_user=request.user)

    if action == 'accept':
        # Creating a friendship
        Friendship.objects.create(user1=request.user, user2=friend_request.from_user)
        friend_request.status = 'accepted'
        friend_request.save()
        return Response({"message": "Friend request accepted"}, status=200)
    
    if action == 'deny':
        friend_request.status = 'rejected'
        friend_request.save()
        return Response({"message": "Friend request denied"}, status=200)
    
    return Response({"error": "Invalid action"}, status=400)

# Get friends' locations API view
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def friends_locations(request):
    user = request.user

    # Get friends from Friendship table
    friends = User.objects.filter(
        Q(friends__user2=user) | Q(friends_of__user1=user)
    ).distinct()

    # Fetch profiles for these friends
    profiles = Profile.objects.filter(user__in=friends).exclude(location__isnull=True)
    serializer = FriendLocationSerializer(profiles, many=True)
    return Response(serializer.data, status=200)