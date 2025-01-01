from django.urls import path
from django.contrib import admin
from .views import get_saved_events, save_event, update_location_api, login_view, logout_view, register_api, user_info, fetch_events_api, get_chatroom, get_chat_messages, post_message, fetch_event_detail, send_friend_request, get_pending_requests, respond_to_request, friends_locations

# Url patterns for the API
urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('register/', register_api, name='register_api'),
    path('update-location/', update_location_api, name='update-location'),
    path('user-info/', user_info, name='user-info'),
    path('events/', fetch_events_api, name='fetch_events_api'),
    path('chatroom/<int:event_id>/', get_chatroom, name='chatroom'),
    path('chatroom/<int:event_id>/messages/', get_chat_messages, name='chat-messages'),
    path('chatroom/<int:event_id>/send/', post_message, name='send-message'),
    path('events/<int:event_id>/', fetch_event_detail, name='fetch_event_detail'),
    path('events/<int:event_id>/save/', save_event, name='save_event'),
    path('events/saved/', get_saved_events, name='get_saved_events'),
    path('friends/request/', send_friend_request, name='send_friend_request'),
    path('friends/pending/', get_pending_requests, name='get_pending_requests'),
    path('friends/respond/', respond_to_request, name='respond_to_request'),
    path('friends/locations/', friends_locations, name='friends-locations'),
]
