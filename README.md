# Advanced Web Mapping CA 2:
In this readme I will discuss and break down of the technical architecture and purpose of my advanced web mapping CA 2 assignment. This project leverages modern web technologies to build an interactive event mapping platform with geolocation features and real-time social engagement. By integrating React for the frontend, Django with Django Rest Framework for the backend, and PostgreSQL/PostGIS for geospatial data, the application ensures seamless data flow and scalability. REST APIs enable smooth communication between services, supporting user authentication, event management, and friend tracking. Docker and Nginx handle deployment and traffic routing, while Django admin and pgAdmin simplify database management.

### Link to site: 
* https://c21755919awm24.xyz/
### Link to docker repositories (backend and frontend): 
* https://hub.docker.com/repository/docker/cianmk/geodjango_tutorial_image/general
* https://hub.docker.com/repository/docker/cianmk/frontend_image/general

# Features Overiew:
* **User Authentication:** Signup, login, and logout functionality with protected routing.
* **Geolocation:** Users can see their location and see a closest events list using a 5km radius.
* **Event Data:** Event data is sourced from Ticketmaster API which supplies event name, location, date etc.
* **Interactive Map:** Utilises Leaflet for map rendering with markers for events and user location.
* **Creating, Manipulating and Storing Spatial Data:** I am able to create, manipulate, and store data in my django admin page.
* **Search Functionality:** Users are able to search for specific events and also filter by event category.
* **Save Events:** Users are able to save specific events.
* **View Event Details:** Users can click an event to see more details about it, this includes event routing and event chatroom.
* **Event Routing:** On the event detail page users automatically see a leaflet routing from their current location to the event.
* **Event Chatroom:** Users can chat with other users to organize going to an event, this chat is updated in intervals and users can send friend requests.
* **Friend Requests:** A notification system allows users to send and receive friend requests.
* **Friend Location Updates and Routing:** In the friends hub page users can see their friends last updated location and get routes to that location aswell as see the location of their saved events.

# Architecture Overview

The architecture for this advanced web mapping project leverages Docker containers to manage the various components, ensuring scalability, portability, and ease of deployment. The core components of the architecture include:

- **Frontend:** A React application serving as the user interface.
- **Backend:** A Django application exposing REST APIs for business logic and geospatial data handling.
- **Database:** PostgreSQL with PostGIS for geospatial data storage and queries.
- **Database Management:** PgAdmin 4 to manage the PostgreSQL database through a web interface.
- **Routing:** Nginx as the reverse proxy to manage and route incoming traffic to appropriate containers.

## Nginx Routing Setup
Nginx acts as the central gateway for all incoming traffic, distributing requests to the appropriate services based on the URL paths. This setup ensures that the frontend, backend API, and database management interface are accessible through a unified domain. Below is a breakdown of the Nginx configuration used in production:

### Key Configuration Details
#### 1. HTTP to HTTPS Redirection:
```nginx
server {
    listen 80;
    server_name .c21755919awm24.xyz;
    location / {
        return 301 https://$host$request_uri;
    }
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
}
```
- Listens on port 80 and redirects all traffic to HTTPS (port 443).
- Handles Let's Encrypt certificate challenges for SSL.

#### 2. SSL Configuration and Proxying:
```nginx
server {
    listen 443 ssl;
    server_name .c21755919awm24.xyz;

    ssl_certificate /etc/letsencrypt/live/c21755919awm24.xyz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/c21755919awm24.xyz/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    root /usr/share/nginx/html;
    index index.html;

    location = /favicon.ico { access_log off; log_not_found off; }

    # Proxy to PgAdmin
    location /pgadmin4 {
        proxy_set_header X-Script-Name /pgadmin4;
        proxy_pass http://pgadmin4;
    }

    # Proxy to React frontend
    location / {
        proxy_pass http://frontend_app:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proxy to Django backend
    location /api/ {
        proxy_pass http://awm_django_app:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
- Nginx listens on port 443 for secure connections.
- Certificates are managed through Let's Encrypt.
- Traffic to `/pgadmin4` routes to the PgAdmin container.
- Traffic to `/` routes to the React frontend.
- Traffic to `/api/` routes to the Django backend.

## Docker Containers Overview
Below is a list of Docker containers running in the production environment:

```bash
$ docker ps -a
CONTAINER ID   IMAGE                                COMMAND                  CREATED         STATUS         PORTS                                        NAMES
30bb07d4d5d7   cianmk/geodjango_tutorial_image     "conda run --no-capt..." 12 seconds ago  Up 6 seconds   8001/tcp                                    awm_django_app
d05a252bc605   cianmk/frontend_image               "/docker-entrypoint..."  25 hours ago    Up 25 hours    0.0.0.0:3000->80/tcp, :::3000->80/tcp       frontend_app
1f12e0773d20   wmap_nginx_certbot                  "/docker-entrypoint..."  2 weeks ago     Up 2 weeks     0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp    nginx
ef05b6d2e74e   kartoza/postgis                     "/bin/sh -c /scripts..." 2 months ago    Up 2 months    5432/tcp                                    postgis
a410cb15ce36   dpage/pgadmin4                      "/entrypoint.sh"        2 months ago    Up 2 months    80/tcp, 443/tcp                              pgadmin4
```

- **awm_django_app:** Runs the Django backend application on port 8001.
- **frontend_app:** Serves the React frontend on port 3000.
- **nginx:** Handles incoming HTTP(S) traffic and proxies it to other containers.
- **postgis:** Runs PostgreSQL with PostGIS extension for geospatial data.
- **pgadmin4:** Provides a web interface for managing the PostgreSQL database.

This architecture ensures seamless interaction between frontend, backend, and database components, enabling a responsive and efficient web mapping experience.

## REST APIs and Frontend Integration
A critical part of the project architecture is the REST API, which facilitates communication between the React frontend and the Django backend. This separation of concerns enables asynchronous data exchange, ensuring smooth interaction and a dynamic user experience.

### URL Configuration
Django uses `urls.py` to map API endpoints to specific views. This structure organizes and simplifies backend routing, making it easier to manage API calls.

```python
from django.urls import path
from django.contrib import admin
from .views import get_saved_events, save_event, update_location_api, login_view, logout_view, register_api, user_info, fetch_events_api, get_chatroom, get_chat_messages, post_message, fetch_event_detail, send_friend_request, get_pending_requests, respond_to_request, friends_locations

urlpatterns = [
    path('admin/', admin.site.urls),
    path('events/', fetch_events_api, name='fetch_events_api'),
    path('events/<int:event_id>/', fetch_event_detail, name='fetch_event_detail'),
    path('events/<int:event_id>/save/', save_event, name='save_event'),
    path('events/saved/', get_saved_events, name='get_saved_events'),
]
```
- API endpoints handle event-related operations, such as fetching events, viewing details, and saving events.

### Axios Configuration (Frontend)
To interact with the Django REST API, Axios is used to manage HTTP requests. This configuration ensures seamless communication between the frontend and backend, handling token-based authentication and error management.

```javascript
// Creating an instance of axios
const Axios = axios.create({
  baseURL: 'https://c21755919awm24.xyz/api/', // Base URL
  timeout: 10000, // Request timeout (10 seconds)
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});
```
- `Axios.create` sets the base URL for all API calls.
- Timeout ensures requests do not hang indefinitely.
- Default headers specify content type and accepted formats.

### Example API Calls
#### 1. Fetching Events (Frontend)
```typescript
const fetchEvents = async (category: string) => {
    try {
      const encodedCategory = encodeURIComponent(category);
      const response = await Axios.get(`events/?category=${encodedCategory}`);
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
};
```
- The React frontend sends a GET request to fetch events filtered by category.
- Axios manages the API call and handles token-based authentication.

#### 2. Fetch Events API (Django Backend)
```python
@api_view(['GET'])
@permission_classes([AllowAny])
def fetch_events_api(request):
    category = request.GET.get('category', 'all')
    if category == 'all':
        events = Event.objects.all()
    else:
        events = Event.objects.filter(category=category)

    data = [
        {
            "id": event.id,
            "name": event.name,
            "description": event.description,
            "lat": event.latitude,
            "lon": event.longitude,
            "location": event.location,
            "date": event.date,
            "category": event.category,
            "external_link": event.external_link,
            "image_url": event.image_url
        }
        for event in events
    ]
    return Response(data, status=200)
```
- This API fetches event data from the database, filters by category, and returns a structured JSON response.
- The API is accessible to all users, with no authentication required for event retrieval.

This REST API design ensures a clean, modular structure, allowing the frontend to dynamically interact with backend resources, supporting scalability and maintainability.

# Website Showcase

Below are screenshots showcasing different sections of the website, demonstrating the interface and features available to users.

Login Page
![image](https://github.com/user-attachments/assets/9c7d746d-9772-4870-9c48-4d46dd33de0e)



Registration Page
![image](https://github.com/user-attachments/assets/afa8a956-2e3d-40d7-b338-134409c2b11e)

Events Map View
![image](https://github.com/user-attachments/assets/b86c0d41-1931-4d21-96f5-ce60dc19327f)

Event Details and Chatroom
![image](https://github.com/user-attachments/assets/b2a3bf6f-bac8-4e8e-938b-2482ee832049)


Friends' Locations
![image](https://github.com/user-attachments/assets/30252bae-fd2b-48d5-988a-e47c9b439011)


Saved Events
![image](https://github.com/user-attachments/assets/f4c40819-8ddf-4e13-8ce2-a6e96d7f55c9)

# Django Admin and pgAdmin Database Management

The project leverages Django admin and pgAdmin to manage and manipulate geolocation data, providing an easy way to interact with the database and maintain data integrity.

Django Admin Interface

The Django admin panel allows for easy management of users, events, friendships, and geolocation data. Administrators can add, edit, and delete records directly from the web interface.

Admin Home Page
![image](https://github.com/user-attachments/assets/d70b4004-4ae6-44bf-85d5-cb19d5f6bb29)


User Management
![image](https://github.com/user-attachments/assets/33e230bf-7616-4aa8-bdb8-d748da161b95)


Friendship Management
![image](https://github.com/user-attachments/assets/b065d5e8-ae1a-4e49-acdf-4b614c88e82f)

Event Management
![image](https://github.com/user-attachments/assets/c2346fdf-7969-41d8-a93c-d3c5d52357d6)


pgAdmin Interface

pgAdmin provides a comprehensive interface to manage PostgreSQL databases. This tool allows querying, editing, and visualizing geolocation data stored in the database.

pgAdmin Event Table
![image](https://github.com/user-attachments/assets/57fb5167-c41f-42c0-8ef6-850f430d2b1b)


These tools together ensure seamless data management, enabling administrators to maintain and update geospatial data with ease.


# Project Recap: EventHub Advanced Web Mapping Assigment 2

My project EventHub is a comprehensive demonstration of modern web technologies, integrating React for a dynamic frontend, Django for a powerful backend, and PostgreSQL/PostGIS for efficient geospatial data management. A key component of the project is the extensive use of Django Rest Framework (DRF) to build a set of RESTful APIs that facilitate seamless communication between the frontend and backend. These APIs handle essential operations such as user authentication, event retrieval, friend tracking, and chatroom management, ensuring the decoupling of frontend and backend logic. By leveraging Docker for containerization and Nginx for secure traffic routing, the project ensures scalability, security, and seamless deployment. Its interactive mapping features, real-time geolocation, and social functionalities like event chatrooms and friend tracking foster community engagement and enhance the user experience. The use of Django admin and pgAdmin simplifies data management, making it easy to update and manipulate geospatial data. Overall, this project highlights the strengths of full-stack development, geolocation services, and scalable architecture in creating a responsive and feature-rich application.
