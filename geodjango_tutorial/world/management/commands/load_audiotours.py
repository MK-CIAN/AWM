import csv
from django.core.management.base import BaseCommand
from world.models import AudiotourPoints, AudiotourSubpoints

class Command(BaseCommand):
    help = "Load AudiotourPoints and AudiotourSubpoints data from CSV files."

    def handle(self, *args, **kwargs):
        # Load AudiotourPoints data
        with open('world/data/audiotour_points.csv', newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                AudiotourPoints.objects.update_or_create(
                    id=row['id'],
                    defaults={
                        'name': row['name'],
                        'description': row['description'],
                        'lon': row['lon'],
                        'lat': row['lat'],
                        'category': row['category'],
                    }
                )
            self.stdout.write(self.style.SUCCESS("Loaded AudiotourPoints"))

        # Load AudiotourSubpoints data
        with open('world/data/audiotour_subpoints.csv', newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                tour = AudiotourPoints.objects.get(id=row['audiotour_id'])
                AudiotourSubpoints.objects.update_or_create(
                    id=row['id'],
                    defaults={
                        'audiotour': tour,
                        'name': row['name'],
                        'lon': row['lon'],
                        'lat': row['lat'],
                    }
                )
            self.stdout.write(self.style.SUCCESS("Loaded AudiotourSubpoints"))
