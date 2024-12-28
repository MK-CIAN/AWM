import requests
from django.core.management.base import BaseCommand
from world.models import Event
from django.utils.timezone import now, timedelta
from dotenv import load_dotenv
import os

class Command(BaseCommand):
    help = "Fetch events from Ticketmaster API and store/update them in the database."

    load_dotenv()

    def handle(self, *args, **kwargs):
        # Fetch Ticketmaster API key from environment variables
        TICKETMASTER_API_KEY = os.getenv('TICKETMASTER_API_KEY')
        if not TICKETMASTER_API_KEY:
            self.stderr.write(self.style.ERROR("Ticketmaster API key is not set in environment variables."))
            return

        # API endpoint and parameters
        url = "https://app.ticketmaster.com/discovery/v2/events.json"
        today = now()
        next_month = today + timedelta(days=30)

        params = {
            "apikey": TICKETMASTER_API_KEY,
            "countryCode": "IE",  # Ireland
            "radius": 100,        # Radius in miles
            "unit": "miles",
            "latlong": "53.3498,-6.2603",  # Latitude and Longitude of Dublin
            "sort": "date,asc",   # Sort by date (ascending)
            "startDateTime": today.isoformat().split('.')[0] + 'Z',  # Remove fractional seconds and add 'Z'
            "endDateTime": next_month.isoformat().split('.')[0] + 'Z',  # One month from today
            "size": 200,  # Number of events per page (max supported by Ticketmaster is 200)
        }

        page = 0  # Start with the first page
        total_events = 0

        while True:
            params["page"] = page
            try:
                response = requests.get(url, params=params)
                response.raise_for_status()
                data = response.json()

                # Extract events from the response
                events_data = data.get("_embedded", {}).get("events", [])
                for event_data in events_data:
                    event_id = event_data.get("id")
                    if not event_id:
                        continue

                    venue = event_data.get("_embedded", {}).get("venues", [{}])[0]

                    # Extract the image URL (choosing the first image or a large one)
                    images = event_data.get("images", [])
                    image_url = None
                    if images:
                        # Prioritize large images if available
                        large_images = [img for img in images if img.get("width", 0) > 800]
                        image_url = large_images[0]["url"] if large_images else images[0]["url"]

                    # Extract category
                    category = None
                    classifications = event_data.get("classifications", [])
                    if classifications:
                        category = classifications[0].get("segment", {}).get("name", None)

                    if not category:
                        continue  # Skip if category is null

                    # Store or update the event
                    Event.objects.update_or_create(
                        event_id=event_id,
                        defaults={
                            "name": event_data["name"],
                            "description": event_data.get("info", ""),
                            "date": event_data["dates"]["start"]["dateTime"],
                            "location": venue.get("name", ""),
                            "latitude": venue.get("location", {}).get("latitude"),
                            "longitude": venue.get("location", {}).get("longitude"),
                            "external_link": event_data["url"],
                            "api_source": "Ticketmaster",
                            "category": category,
                            "image_url": image_url,  # Save image URL
                        },
                    )
                    total_events += 1

                self.stdout.write(f"Fetched page {page} with {len(events_data)} events.")

                # Check if there are more pages
                if page >= data["page"]["totalPages"] - 1:
                    break
                page += 1  # Move to the next page

            except requests.RequestException as e:
                self.stderr.write(self.style.ERROR(f"Error fetching events: {e}"))
                break

        self.stdout.write(self.style.SUCCESS(f"Successfully fetched and stored {total_events} events."))
