from django.urls import path
from .views import audiotour_points_api, update_location_api, login_view, logout_view, register_api, user_info
from . import views

urlpatterns = [
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('register/', register_api, name='register_api'),
    path('audiotour-points/', audiotour_points_api, name='audiotour-points'),
    path('update-location/', update_location_api, name='update-location'),
    path('user-info/', user_info, name='user-info'),
]
