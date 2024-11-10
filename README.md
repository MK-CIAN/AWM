# Advanced Web Mapping CA1

This is the repository for my Advanced Web Mapping CA1, my website is targeting tourists interested in discovering nearby audio tours. The site combines geolocation and interactive map features to enhance the user’s touring experience. The project is built using Django and Django Templates, leveraging PostgreSQL with PostGIS for spatial data management, and is managed via PgAdmin 4. Mapping functions are powered by Leaflet JS and OpenStreetMap, and the entire project is containerized using Docker for deployment, hosted on AWS.
Accessing the Website

My website is live and accessible at: https://c21755919awm24.xyz
## Project Overview

This website is designed to offer tourists an easy way to find, explore, and navigate nearby audio tours. Users can view their current location using a real-time interactive map, explore nearby audio tours, and follow a step-by-step path through each tour.
## Key Features
- User Location & Audio Tours: The map shows the user's current location and displays nearby audio tours, each with a distinct starting point.
- Interactive Map with Detailed Path: Clicking an audio tour’s starting point displays all related sub-points on the map, with a line guiding users through each step.
- Filtering Options: Users can filter audio tours by category, including options like education, nature, tourist attractions, and more.
- User Authentication & Access Control: The site includes secure user sign-up, login, and access control, protecting main pages from unauthorized users.
![image](https://github.com/user-attachments/assets/9e847c3c-c9f6-48cf-afbd-9cacd2aa31a1)
![image](https://github.com/user-attachments/assets/1fddb4ed-8cfe-430c-88a5-570d0c8661f6)
![image](https://github.com/user-attachments/assets/ff2f79d1-dc3b-48ba-a733-448800912122)
![image](https://github.com/user-attachments/assets/12a4d904-7fd2-40fe-9071-e34aaab45429)


## Upcoming Features
- Audio Playback: The next phase will introduce audio playback for tours, allowing users to listen to narrated guides as they explore each location.
- User Uploading of Audiotours.

## Tech Stack
- Backend: Django and Django Templates for managing server-side logic and templating.
- Database: PostgreSQL with PostGIS for geospatial data handling and storage.
- Database Management: PgAdmin 4 for managing and monitoring database activity.
- Mapping: Leaflet JS and OpenStreetMap for rendering interactive maps with detailed user location tracking.
- Frontend: Leaflet and custom JavaScript to enhance user interaction with the map.
- Containerization & Deployment: Docker for containerizing the application and AWS for hosting.
