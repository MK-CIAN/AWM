from django.contrib.gis import admin
from .models import WorldBorder, AudiotourPoints

admin.site.register(WorldBorder, admin.GISModelAdmin)

class AudiotourPointsAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'lon', 'lat', 'category')
    list_filter = ('category',)