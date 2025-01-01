from django.core.management.base import BaseCommand
from world.models import Event, ChatRoom

# Create chat rooms for all events
class Command(BaseCommand):
    help = 'Create chat rooms for all events'
    def handle(self, *args, **kwargs):
        events = Event.objects.all()
        for event in events:
            ChatRoom.objects.get_or_create(event=event, defaults={"name": f"Chat for {event.name}"})
        self.stdout.write(self.style.SUCCESS("Chat rooms created for all events."))
