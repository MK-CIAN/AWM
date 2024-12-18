from urllib import response
from django.contrib.gis.geos import Point
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.contrib.auth import get_user_model, login, logout, authenticate
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm

from .forms import CustomUserCreationForm
from .models import Profile, AudiotourPoints
import json 
User = get_user_model()

def set_user_location(user_id, latitude, longitude):
    user = User.objects.get(id=user_id)
    location = Point(longitude, latitude)  # Note: Point takes (longitude, latitude)

    # Create or update the user's profile
    profile, created = Profile.objects.get_or_create(user=user)
    profile.location = location
    profile.save()

    return profile

def login_view(request):
    #Redirecting Authenticated Users to map_view
    if request.user.is_authenticated:
        return redirect('map_view')
    
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect('map_view')  # Redirect to the main map view
    else:
        form = AuthenticationForm()
    return render(request, 'world/login.html', {'form': form})

def logout_view(request):
    logout(request)
    return redirect('login')  # Redirect to the login page after logout

def map_view(request):
    if request.user.is_authenticated:
        # Get the user's location if available
        try:
            user_profile = Profile.objects.get(user=request.user)
            location = {
                "latitude": user_profile.location.y,
                "longitude": user_profile.location.x
            } if user_profile.location else None
        except Profile.DoesNotExist:
            location = None
            print("Profile.DoesNotExist: No profile found for the authenticated user.")

        # Retrieve the selected category from the request parameters (default to "all" if none is selected)
        selected_category = request.GET.get('category', 'all')
        print(f"Selected Category: {selected_category}")  # Debugging line

        # Filter audiotour points by the selected category, or show all if "all" is selected
        if selected_category == 'all':
            audiotour_points_queryset = AudiotourPoints.objects.all()
        else:
            audiotour_points_queryset = AudiotourPoints.objects.filter(category=selected_category)

        # Retrieve audiotour points along with their related subpoints
        audiotour_points = [
            {
                "name": point.name,
                "description": point.description,
                "lon": point.lon,
                "lat": point.lat,
                "subpoints": [
                    {
                        "name": subpoint.name,
                        "lon": subpoint.lon,
                        "lat": subpoint.lat
                    }
                    for subpoint in point.subpoints.all()
                ]
            }
            for point in audiotour_points_queryset
        ]

        # Serialize audiotour points data to JSON
        audiotour_points_json = json.dumps(audiotour_points) if audiotour_points else "[]"

        # Debugging output
        print("Audiotour Points JSON:", audiotour_points_json)

        # Get available categories for the dropdown menu
        categories = AudiotourPoints.CATEGORY_CHOICES

        # Pass the JSON data, user location, categories, and selected category to the template
        return render(request, 'world/map.html', {
            'user': request.user,
            'location': location,
            'audiotour_points_json': audiotour_points_json,
            'categories': categories,
            'selected_category': selected_category
        })
    else:
        return redirect('login')  # Redirect to login if not authenticated
    
def update_location(request):
    if request.method == 'POST' and request.user.is_authenticated:
        latitude = request.POST.get('latitude')
        longitude = request.POST.get('longitude')

        if latitude and longitude:
            try:
                latitude = float(latitude)
                longitude = float(longitude)
                location = Point(longitude, latitude)
                
                profile, created = Profile.objects.get_or_create(user=request.user)
                profile.location = location
                profile.save()

                return JsonResponse({'success': True})
            except ValueError:
                return JsonResponse({'success': False, 'error': 'Invalid coordinates'})
        else:
            return JsonResponse({'success': False, 'error': 'Missing coordinates'})
    return JsonResponse({'success': False, 'error': 'Invalid request'})

def register(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            form.save()  # Create the new user
            return redirect('login')  # Redirect to login page after registration
    else:
        form = CustomUserCreationForm()
    
    return render(request, 'world/register.html', {'form': form})

