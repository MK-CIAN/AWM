from django.urls import path
from . import views

urlpatterns = [
    path('map/', views.map_view, name='map_view'),
    path('', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('register/', views.register, name='register'),
]