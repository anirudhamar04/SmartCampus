# Database Setup Instructions

This directory contains SQL files for setting up the database for the Smart Campus Management system.

## Files

- `schema.sql`: Contains the database schema definition (tables, relations, indexes)
- `data.sql`: Contains sample data to populate the database for testing

## Usage Instructions

### Option 1: Using Spring Boot Auto-Configuration

1. Make sure your `application.properties` or `application.yml` includes the following settings:

```properties
# Database initialization settings
spring.sql.init.mode=always
spring.sql.init.schema-locations=classpath:schema.sql
spring.sql.init.data-locations=classpath:data.sql
spring.jpa.hibernate.ddl-auto=none
```

With these settings, Spring Boot will automatically initialize the database using these SQL files when the application starts.

### Option 2: Manual Execution

If you prefer to initialize the database manually, you can run these SQL files against your database:

1. First run `schema.sql` to create the database structure
2. Then run `data.sql` to populate the database with sample data

Example with MySQL command line:

```bash
mysql -u username -p your_database_name < schema.sql
mysql -u username -p your_database_name < data.sql
```

## Sample Data Overview

The `data.sql` file includes sample data for:

- Users (1 admin, 3 faculty members, 6 students)
- Courses (5 courses across different departments)
- Course enrollments (student-to-course assignments)
- Teacher assignments (faculty-to-course assignments)
- Attendance records (for several class sessions)

### User Credentials

For demo purposes, all users have the same password: "password" (BCrypt-encoded).

- Admin: username `admin`
- Faculty: usernames `professor1`, `professor2`, `professor3`
- Students: usernames `student1` through `student6`

## Notes on Production Use

Before using this in production:

1. Remove or modify the sample data
2. Use a proper password management strategy
3. Consider implementing a database migration tool like Flyway or Liquibase 