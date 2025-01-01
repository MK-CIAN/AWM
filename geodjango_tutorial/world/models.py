from django.contrib.gis.db import models
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.timezone import now

#Redundant code from the tutorial
class WorldBorder(models.Model):
    # Regular Django fields corresponding to the attributes in the
    # world borders shapefile.
    name = models.CharField(max_length=50)
    area = models.IntegerField()
    pop2005 = models.IntegerField('Population 2005')
    fips = models.CharField('FIPS Code', max_length=2, null=True)
    iso2 = models.CharField('2 Digit ISO', max_length=2)
    iso3 = models.CharField('3 Digit ISO', max_length=3)
    un = models.IntegerField('United Nations Code')
    region = models.IntegerField('Region Code')
    subregion = models.IntegerField('Sub-Region Code')
    lon = models.FloatField()
    lat = models.FloatField()
    # GeoDjango-specific: a geometry field (MultiPolygonField)
    mpoly = models.MultiPolygonField()

    # Returns the string representation of the model.
    def __str__(self):
        return self.name
    
#Store a point location on a user's profile.

User = get_user_model()

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    location = models.PointField(null=True, blank=True)
    last_updated = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if self.location:  # Update timestamp only if location is set
            self.last_updated = now()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.user.username

# Redundant code from past version
class AudiotourPoints(models.Model):
    CATEGORY_CHOICES = [
        ('art', 'Art'),
        ('history', 'History'),
        ('tourist', 'Tourist Attractions'),
        ('nature', 'Nature'),
        ('education', 'Education'),
        # Add more categories as needed
    ]

    name = models.CharField(max_length=50)
    description = models.CharField(max_length=200)
    lon = models.FloatField()
    lat = models.FloatField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='tourist')  # New field

    def __str__(self):
        return self.name

#Redundant code from past version
class AudiotourSubpoints(models.Model):
    audiotour = models.ForeignKey(AudiotourPoints, related_name="subpoints", on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    lon = models.FloatField()
    lat = models.FloatField()
    
    def __str__(self):
        return f"{self.audiotour.name} - {self.name}"
    
# Signal to automatically create a Profile when a new User is created
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

# Event model to store information about events
class Event(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    date = models.DateTimeField()
    category = models.CharField(max_length=100, null=True, blank=True)
    external_link = models.URLField()  # Link to the event page
    api_source = models.CharField(max_length=50, null=True, blank=True)  # Source of event (e.g., Eventbrite, Ticketmaster)
    event_id = models.CharField(max_length=255, unique=True)  # Unique identifier from the API
    image_url = models.URLField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

# ChatRoom model to store the chatroom for each event
class ChatRoom(models.Model):
    event = models.OneToOneField(Event, on_delete=models.CASCADE, related_name="chatroom")
    name = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.name} (Event {self.event.name})"

# Message model to store chat messages
class Message(models.Model):
    chatroom = models.ForeignKey(ChatRoom, related_name="messages", on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}: {self.content[:20]} ({self.timestamp})"
    
# Model to store saved events for each user
class SavedEvent(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'event')

# FriendRequest to store friend requests between users  
class FriendRequest(models.Model):
    from_user = models.ForeignKey(User, related_name='sent_requests', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='received_requests', on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('rejected', 'Rejected')])
    timestamp = models.DateTimeField(auto_now_add=True)

# Friendship model to store the friendship between users
class Friendship(models.Model):
    user1 = models.ForeignKey(User, related_name='friends', on_delete=models.CASCADE)
    user2 = models.ForeignKey(User, related_name='friends_of', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)