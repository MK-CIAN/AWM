from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.contrib.gis.geos import Point
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from knox.auth import TokenAuthentication
from knox.models import AuthToken
from world.models import AudiotourPoints, Profile


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


@api_view(['POST'])
def logout_view(request):
    """
    Knox-based API endpoint for user logout.
    """
    request._auth.delete()  # Delete the token used for authentication
    return Response({"success": "Logged out successfully"}, status=200)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_api(request):
    """
    API endpoint for user registration.
    """
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
        validate_password(password)  # Validate the password according to Django standards
        user = User.objects.create_user(username=username, email=email, password=password)
        user.save()
        return Response({"success": "User registered successfully!"}, status=201)
    except ValidationError as e:
        return Response({"error": e.messages}, status=400)
    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_info(request):
    """
    API endpoint to fetch user info for authenticated users.
    """
    user = request.user
    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
    }, status=200)


@api_view(['GET'])
@permission_classes([AllowAny])
def audiotour_points_api(request):
    """
    API endpoint for fetching audiotour points.
    """
    category = request.GET.get('category', 'all')
    if category == 'all':
        points = AudiotourPoints.objects.all()
    else:
        points = AudiotourPoints.objects.filter(category=category)

    data = [
        {"id": point.id, "name": point.name, "description": point.description, "lat": point.lat, "lon": point.lon}
        for point in points
    ]
    return Response(data, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_location_api(request):
    """
    API endpoint for updating user location.
    """
    latitude = request.data.get("latitude")
    longitude = request.data.get("longitude")

    if latitude and longitude:
        profile, _ = Profile.objects.get_or_create(user=request.user)
        profile.location = Point(float(longitude), float(latitude))
        profile.save()
        return Response({"success": True}, status=200)
    return Response({"success": False, "error": "Invalid request"}, status=400)
