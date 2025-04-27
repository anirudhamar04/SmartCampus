
# Smart Campus Management Backend

## Overview

The Smart Campus Management backend is a comprehensive RESTful API system built to support a modern campus management application. It provides endpoints for managing users, courses, attendance, facilities, events, notifications, and other essential campus management functionalities.

## Controllers and API Endpoints

### Authentication Controller
**Path**: `/api/auth`

The Authentication Controller manages user authentication and registration processes.

#### APIs:
- `POST /login`: Authenticates users and generates a JWT token
- `POST /register`: Registers a new user in the system
- `GET /me`: Returns the currently authenticated user's information

### User Controller
**Path**: `/api/users`

The User Controller handles user management operations.

#### APIs:
- `POST /`: Creates a new user (Admin only)
- `PUT /{id}`: Updates a user's information (Admin or the user itself)
- `DELETE /{id}`: Deletes a user (Admin only)
- `GET /{id}`: Gets user information by ID (Admin or the user itself)
- `GET /`: Gets all users (Admin only)
- `GET /role/{role}`: Gets users by role (Admin only)

### Course Controller
**Path**: `/api/courses`

The Course Controller manages course-related operations, including course creation, updates, and student enrollment.

#### APIs:
- `POST /`: Creates a new course (Admin or Faculty only)
- `PUT /{id}`: Updates a course (Admin or Faculty only)
- `GET /{id}`: Gets a course by ID
- `GET /`: Gets all courses
- `GET /teacher/{teacherId}`: Gets courses by teacher
- `GET /my-courses`: Gets courses for the currently logged-in faculty or student
- `GET /my-students`: Gets students enrolled in courses taught by the currently logged-in faculty (Faculty only)
- `GET /{courseId}/students`: Gets students enrolled in a specific course (Admin or Faculty only)
- `GET /student/{studentId}`: Gets courses by student
- `POST /{courseId}/students/{studentId}`: Enrolls a student in a course (Admin or Faculty only)
- `DELETE /{courseId}/students/{studentId}`: Unenrolls a student from a course (Admin or Faculty only)
- `POST /{courseId}/teachers/{teacherId}`: Assigns a teacher to a course (Admin only)
- `DELETE /{courseId}/teachers/{teacherId}`: Removes a teacher from a course (Admin only)

### Attendance Controller
**Path**: `/api/attendance`

The Attendance Controller manages student attendance records.

#### APIs:
- `POST /`: Creates an attendance record (Admin or Faculty only)
- `PUT /{id}`: Updates an attendance record (Admin or Faculty only)
- `GET /{id}`: Gets an attendance record by ID
- `GET /student/{studentId}`: Gets attendance records for a student
- `GET /course/{courseId}`: Gets attendance records for a course
- `GET /student/{studentId}/course/{courseId}`: Gets attendance records for a student in a specific course
- `GET /date-range`: Gets attendance records within a date range
- `GET /course/{courseId}/date-range`: Gets attendance records for a course within a date range
- `GET /teacher/{teacherId}`: Gets attendance records by teacher
- `POST /bulk`: Creates attendance records in bulk (Admin or Faculty only)
- `GET /student/{studentId}/course/{courseId}/percentage`: Gets attendance percentage for a student in a course
- `GET /student/{studentId}/overall-percentage`: Gets overall attendance percentage for a student across all courses

### Course Resource Controller
**Path**: `/api/course-resources`

The Course Resource Controller manages course-related resources such as materials, assignments, and notes.

#### APIs:
- `POST /`: Adds a resource to a course
- `PUT /{resourceId}`: Updates a course resource
- `DELETE /{resourceId}`: Deletes a course resource
- `GET /{resourceId}`: Gets a course resource by ID
- `GET /course/{courseId}`: Gets resources for a specific course
- `GET /teacher/{teacherId}`: Gets resources uploaded by a specific teacher
- `GET /course/{courseId}/type/{resourceType}`: Gets resources by type for a specific course
- `GET /download/{resourceId}`: Downloads a resource file
- `GET /resource-types`: Gets available resource types
- `GET /all`: Gets all course resources
- `GET /teacher/{teacherId}/courses`: Gets courses taught by a specific teacher

### Facility Booking Controller
**Path**: `/api/facility-bookings`

The Facility Booking Controller manages facility reservation processes.

#### APIs:
- `GET /`: Gets all facility bookings
- `GET /{id}`: Gets a booking by ID
- `GET /teacher/{teacherId}`: Gets bookings made by a specific teacher
- `GET /facility/{facilityId}`: Gets bookings for a specific facility
- `POST /`: Creates a new facility booking
- `PUT /{id}`: Updates a facility booking
- `DELETE /{id}`: Deletes a facility booking

### Facility Controller
**Path**: `/api/facilities`

The Facility Controller manages campus facilities information.

#### APIs:
- `GET /`: Gets all facilities
- `GET /{id}`: Gets a facility by ID
- `POST /`: Creates a new facility
- `PUT /{id}`: Updates a facility
- `DELETE /{id}`: Deletes a facility

### Event Controller
**Path**: `/api/events`

The Event Controller manages campus events and event registration.

#### APIs:
- `POST /`: Creates a new event
- `PUT /{id}`: Updates an event
- `GET /{id}`: Gets an event by ID
- `GET /`: Gets all events
- `GET /upcoming`: Gets upcoming events
- `POST /{eventId}/register/{userId}`: Registers a user for an event
- `DELETE /{eventId}/unregister/{userId}`: Unregisters a user from an event
- `GET /organizer/{organizerId}`: Gets events by organizer
- `GET /date-range`: Gets events within a date range
- `DELETE /{id}`: Deletes an event

### Notification Controller
**Path**: `/api/notifications`

The Notification Controller manages system notifications.

#### APIs:
- `GET /`: Gets all notifications
- `POST /`: Creates a new notification
- `PUT /{id}/read`: Marks a notification as read
- `PUT /user/{userId}/read-all`: Marks all notifications for a user as read
- `GET /{id}`: Gets a notification by ID
- `GET /user/{userId}`: Gets notifications for a specific user
- `GET /user/{userId}/unread`: Gets unread notifications for a user
- `GET /user/{userId}/type/{type}`: Gets notifications by type for a user
- `GET /sent/{userId}`: Gets notifications sent by a user
- `GET /user/{userId}/unread/count`: Gets the count of unread notifications for a user
- `DELETE /{id}`: Deletes a notification
- `POST /broadcast/role`: Broadcasts a notification to users with a specific role
- `GET /stats`: Gets notification statistics

### Lost and Found Controller
**Path**: `/api/lost-found`

The Lost and Found Controller manages lost and found items on campus.

#### APIs:
- `GET /items`: Gets all lost and found items
- `GET /user/{userId}`: Gets items reported or claimed by a specific user
- `GET /status/{status}`: Gets items by status
- `GET /category/{category}`: Gets items by category
- `GET /items/{id}`: Gets an item by ID
- `POST /items`: Reports a new lost or found item
- `PUT /items/{id}`: Updates an item
- `POST /items/{id}/claim`: Claims an item
- `PUT /items/{id}/return`: Marks an item as returned to its owner

### Additional Controllers

#### Book Controller
**Path**: `/api/bookings`

Manages general bookings in the system.

#### Cafeteria Controller
**Path**: `/api/cafeteria`

Manages cafeteria-related information and services.

#### Feedback Controller
**Path**: `/api/feedback`

Manages user feedback collection and processing.

#### Resource Controller
**Path**: `/api/resources`

Manages general resources in the system.

#### Visitor Pass Controller
**Path**: `/api/visitor-passes`

Manages visitor passes for campus guests.

## Security and Authentication

The backend uses Spring Security with JWT (JSON Web Token) authentication. Most endpoints require authentication, and many have role-based authorization requirements:

- `ADMIN`: Has full access to all endpoints
- `FACULTY`: Has access to teaching-related endpoints
- `STUDENT`: Has access to learning-related endpoints

Authentication is managed through the AuthenticationController, which provides login and registration endpoints. Once authenticated, users receive a JWT token that must be included in the Authorization header of subsequent requests.

## Cross-Origin Resource Sharing (CORS)

The backend is configured to allow cross-origin requests from `http://localhost:3000`, which is the default address for the frontend application in development mode.
