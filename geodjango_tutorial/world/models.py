from django.contrib.gis.db import models
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver

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

    def __str__(self):
        return self.user.username
    
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
