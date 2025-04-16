# Smart Campus Backend

A comprehensive backend system for managing a smart campus environment, built with Spring Boot and MySQL.

## Features

- User authentication and authorization with JWT
- Role-based access control
- User management
- QR code generation
- API endpoints for various campus services

## Prerequisites

- Java 17 or higher
- MySQL 8.0 or higher
- Maven 3.6 or higher

## Setup

1. Clone the repository
2. Configure MySQL database:
   - Create a database named `smart_campus`
   - Update the database credentials in `application.properties`

3. Build the project:
```bash
mvn clean install
```

4. Run the application:
```bash
mvn spring-boot:run
```

## API Endpoints

### Authentication
- POST `/api/auth/login` - User login
- POST `/api/auth/register` - User registration
- GET `/api/auth/me` - Get current user details

### User Management
- GET `/api/users` - Get all users (Admin only)
- GET `/api/users/{id}` - Get user by ID
- POST `/api/users` - Create new user (Admin only)
- PUT `/api/users/{id}` - Update user
- DELETE `/api/users/{id}` - Delete user (Admin only)
- GET `/api/users/role/{role}` - Get users by role (Admin only)

## Security

The application uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <token>
```

## Database Schema

The application uses JPA/Hibernate for database operations. The schema will be automatically created based on the entity classes.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License. 