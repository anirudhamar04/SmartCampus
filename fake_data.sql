-- Smart Campus Management System - Fake Data Population Script
-- Disables foreign key checks, truncates all tables, and populates with fake data
-- All user passwords set to: $2a$10$1rDGzF1agC2QzjIu/RIoLORdanmWhFqPf3CV6hmk0ZcprpvauWgy2

-- Disable foreign key checks to allow truncation
SET FOREIGN_KEY_CHECKS = 0;

-- Truncate all tables
TRUNCATE TABLE attendance;
TRUNCATE TABLE bookings;
TRUNCATE TABLE cafeteria_items;
TRUNCATE TABLE cafeteria_order_items;
TRUNCATE TABLE cafeteria_orders;
TRUNCATE TABLE course_enrollments;
TRUNCATE TABLE course_teachers;
TRUNCATE TABLE courses;
TRUNCATE TABLE event_participants;
TRUNCATE TABLE events;
TRUNCATE TABLE facilities;
TRUNCATE TABLE feedback;
TRUNCATE TABLE lost_found_items;
TRUNCATE TABLE resources;
TRUNCATE TABLE users;
TRUNCATE TABLE visitor_passes;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Populate users table
INSERT INTO users (username, password, full_name, email, phone_number, role, enabled, account_non_expired, account_non_locked, credentials_non_expired)
VALUES
-- Admin users
('admin1', '$2a$10$1rDGzF1agC2QzjIu/RIoLORdanmWhFqPf3CV6hmk0ZcprpvauWgy2', 'Admin User', 'admin@smartcampus.com', '123-456-7890', 'ADMIN', true, true, true, true),
('admin2', '$2a$10$1rDGzF1agC2QzjIu/RIoLORdanmWhFqPf3CV6hmk0ZcprpvauWgy2', 'System Admin', 'sysadmin@smartcampus.com', '123-456-7891', 'ADMIN', true, true, true, true),

-- Faculty users
('professor1', '$2a$10$1rDGzF1agC2QzjIu/RIoLORdanmWhFqPf3CV6hmk0ZcprpvauWgy2', 'Jennifer Hopkins', 'jhopkins@smartcampus.com', '123-456-7892', 'FACULTY', true, true, true, true),
('professor2', '$2a$10$1rDGzF1agC2QzjIu/RIoLORdanmWhFqPf3CV6hmk0ZcprpvauWgy2', 'David Martinez', 'dmartinez@smartcampus.com', '123-456-7893', 'FACULTY', true, true, true, true),
('professor3', '$2a$10$1rDGzF1agC2QzjIu/RIoLORdanmWhFqPf3CV6hmk0ZcprpvauWgy2', 'Sarah Johnson', 'sjohnson@smartcampus.com', '123-456-7894', 'FACULTY', true, true, true, true),
('professor4', '$2a$10$1rDGzF1agC2QzjIu/RIoLORdanmWhFqPf3CV6hmk0ZcprpvauWgy2', 'Robert Wilson', 'rwilson@smartcampus.com', '123-456-7895', 'FACULTY', true, true, true, true),
('professor5', '$2a$10$1rDGzF1agC2QzjIu/RIoLORdanmWhFqPf3CV6hmk0ZcprpvauWgy2', 'Michael Chen', 'mchen@smartcampus.com', '123-456-7896', 'FACULTY', true, true, true, true),

-- Student users
('student1', '$2a$10$1rDGzF1agC2QzjIu/RIoLORdanmWhFqPf3CV6hmk0ZcprpvauWgy2', 'John Smith', 'jsmith@student.smartcampus.com', '123-456-7897', 'STUDENT', true, true, true, true),
('student2', '$2a$10$1rDGzF1agC2QzjIu/RIoLORdanmWhFqPf3CV6hmk0ZcprpvauWgy2', 'Ana Garcia', 'agarcia@student.smartcampus.com', '123-456-7898', 'STUDENT', true, true, true, true),
('student3', '$2a$10$1rDGzF1agC2QzjIu/RIoLORdanmWhFqPf3CV6hmk0ZcprpvauWgy2', 'Tim Lee', 'tlee@student.smartcampus.com', '123-456-7899', 'STUDENT', true, true, true, true),
('student4', '$2a$10$1rDGzF1agC2QzjIu/RIoLORdanmWhFqPf3CV6hmk0ZcprpvauWgy2', 'Jay Patel', 'jpatel@student.smartcampus.com', '123-456-7900', 'STUDENT', true, true, true, true),
('student5', '$2a$10$1rDGzF1agC2QzjIu/RIoLORdanmWhFqPf3CV6hmk0ZcprpvauWgy2', 'Lisa Rodriguez', 'lrodriguez@student.smartcampus.com', '123-456-7901', 'STUDENT', true, true, true, true),
('student6', '$2a$10$1rDGzF1agC2QzjIu/RIoLORdanmWhFqPf3CV6hmk0ZcprpvauWgy2', 'Maria Jackson', 'mjackson@student.smartcampus.com', '123-456-7902', 'STUDENT', true, true, true, true),
('student7', '$2a$10$1rDGzF1agC2QzjIu/RIoLORdanmWhFqPf3CV6hmk0ZcprpvauWgy2', 'Anil Doshi', 'adoshi@student.smartcampus.com', '123-456-7903', 'STUDENT', true, true, true, true),
('student8', '$2a$10$1rDGzF1agC2QzjIu/RIoLORdanmWhFqPf3CV6hmk0ZcprpvauWgy2', 'Brian Williams', 'bwilliams@student.smartcampus.com', '123-456-7904', 'STUDENT', true, true, true, true),

-- Staff users
('staff1', '$2a$10$1rDGzF1agC2QzjIu/RIoLORdanmWhFqPf3CV6hmk0ZcprpvauWgy2', 'James Baker', 'jbaker@staff.smartcampus.com', '123-456-7906', 'STAFF', true, true, true, true),
('staff2', '$2a$10$1rDGzF1agC2QzjIu/RIoLORdanmWhFqPf3CV6hmk0ZcprpvauWgy2', 'Rosa Sanchez', 'rsanchez@staff.smartcampus.com', '123-456-7907', 'STAFF', true, true, true, true),
('staff3', '$2a$10$1rDGzF1agC2QzjIu/RIoLORdanmWhFqPf3CV6hmk0ZcprpvauWgy2', 'Peter Nguyen', 'pnguyen@staff.smartcampus.com', '123-456-7908', 'STAFF', true, true, true, true),

-- Guest users
('guest1', '$2a$10$1rDGzF1agC2QzjIu/RIoLORdanmWhFqPf3CV6hmk0ZcprpvauWgy2', 'Guest User', 'guest1@example.com', '123-456-7909', 'GUEST', true, true, true, true),
('guest2', '$2a$10$1rDGzF1agC2QzjIu/RIoLORdanmWhFqPf3CV6hmk0ZcprpvauWgy2', 'Visitor User', 'guest2@example.com', '123-456-7910', 'GUEST', true, true, true, true);

-- Populate courses table
INSERT INTO courses (name, course_code, description, department, credits, semester, start_date, end_date, capacity, location, schedule)
VALUES 
('Introduction to Computer Science', 'CS101', 'Basic concepts of computer programming and computer science', 'Computer Science', 3, 'FALL_2023', '2023-09-01', '2023-12-20', 100, 'Room A101', '{"days": ["Monday", "Wednesday"], "time": "10:00-11:30"}'),
('Data Structures and Algorithms', 'CS102', 'Fundamental data structures and algorithms in computer science', 'Computer Science', 4, 'SPRING_2024', '2024-01-15', '2024-05-15', 80, 'Room B202', '{"days": ["Tuesday", "Thursday"], "time": "13:00-14:30"}'),
('Calculus I', 'MATH101', 'Introduction to differential and integral calculus', 'Mathematics', 4, 'FALL_2023', '2023-09-01', '2023-12-20', 120, 'Room C303', '{"days": ["Monday", "Wednesday", "Friday"], "time": "09:00-10:00"}'),
('Physics for Engineers', 'PHYS201', 'Physics principles for engineering applications', 'Physics', 4, 'SPRING_2024', '2024-01-15', '2024-05-15', 60, 'Room D404', '{"days": ["Tuesday", "Thursday"], "time": "10:00-12:00"}'),
('English Composition', 'ENG101', 'Principles of effective written communication', 'English', 3, 'FALL_2023', '2023-09-01', '2023-12-20', 30, 'Room E505', '{"days": ["Monday", "Wednesday"], "time": "14:00-15:30"}'),
('Introduction to Psychology', 'PSYCH101', 'Basic concepts of human behavior and mental processes', 'Psychology', 3, 'SPRING_2024', '2024-01-15', '2024-05-15', 100, 'Room F606', '{"days": ["Tuesday", "Thursday"], "time": "15:00-16:30"}');

-- Link courses to teachers
INSERT INTO course_teachers (course_id, teacher_id)
VALUES 
(1, 21), -- CS101 taught by Jennifer Hopkins
(2, 21), -- CS102 taught by David Martinez
(3, 21), -- MATH101 taught by Sarah Johnson
(4, 21), -- PHYS201 taught by Robert Wilson
(5, 21), -- ENG101 taught by Michael Chen
(6, 21); -- PSYCH101 taught by Jennifer Hopkins

-- Enroll students in courses
INSERT INTO course_enrollments (course_id, student_id)
VALUES 
-- CS101 students
(1, 8), (1, 9), (1, 10), (1, 11), (1, 12),
-- CS102 students
(2, 8), (2, 9), (2, 13), (2, 14),
-- MATH101 students
(3, 8), (3, 9), (3, 10), (3, 11), (3, 12), (3, 13),
-- PHYS201 students
(4, 8), (4, 10), (4, 12), (4, 14),
-- ENG101 students
(5, 9), (5, 11), (5, 13),
-- PSYCH101 students
(6, 8), (6, 9), (6, 10), (6, 12);

-- Populate attendance records
INSERT INTO attendance (user_id, course_id, date, status, remarks, recorded_by_id, recorded_at)
VALUES 
-- CS101
(8, 1, '2023-09-05 10:00:00', 'PRESENT', NULL, 3, '2023-09-05 11:30:00'),
(9, 1, '2023-09-05 10:00:00', 'PRESENT', NULL, 3, '2023-09-05 11:30:00'),
(10, 1, '2023-09-05 10:00:00', 'LATE', 'Arrived 15 minutes late', 3, '2023-09-05 11:30:00'),
(11, 1, '2023-09-05 10:00:00', 'ABSENT', NULL, 3, '2023-09-05 11:30:00'),

-- MATH101
(8, 3, '2023-09-06 09:00:00', 'PRESENT', NULL, 5, '2023-09-06 10:00:00'),
(9, 3, '2023-09-06 09:00:00', 'PRESENT', NULL, 5, '2023-09-06 10:00:00'),
(10, 3, '2023-09-06 09:00:00', 'LATE', 'Traffic delay', 5, '2023-09-06 10:00:00'),
(11, 3, '2023-09-06 09:00:00', 'ABSENT', 'Medical appointment', 5, '2023-09-06 10:00:00');

-- Populate events
INSERT INTO events (title, description, start_time, end_time, location, organizer_id, event_type, max_participants, registration_deadline, image_url, status)
VALUES 
('Fall Welcome Mixer', 'Meet and greet for new students', '2023-09-10 18:00:00', '2023-09-10 21:00:00', 'Student Center', 3, 'SOCIAL', 200, '2023-09-08 23:59:59', '/images/events/mixer.jpg', 'COMPLETED'),
('Tech Career Fair', 'Annual career fair with tech companies', '2023-10-15 10:00:00', '2023-10-15 16:00:00', 'Engineering Building', 4, 'CAREER', 500, '2023-10-10 23:59:59', '/images/events/fair.jpg', 'SCHEDULED'),
('Research Symposium', 'Student research presentations', '2023-11-05 09:00:00', '2023-11-05 17:00:00', 'Science Building', 5, 'ACADEMIC', 150, '2023-10-25 23:59:59', '/images/events/symposium.jpg', 'SCHEDULED');

-- Populate event participants
INSERT INTO event_participants (event_id, user_id)
VALUES 
(1, 8),
(1, 9),
(1, 10),
(2, 8),
(2, 9),
(3, 12);

-- Populate facilities
INSERT INTO facilities (name, location, capacity, type, available, description, status, opening_time, closing_time, image_url)
VALUES 
('Main Auditorium', 'Administration Building', 500, 'AUDITORIUM', true, 'Large auditorium with stage and AV equipment', 'ACTIVE', '08:00:00', '22:00:00', '/images/facilities/auditorium.jpg'),
('Conference Room A', 'Business Building', 30, 'CONFERENCE_ROOM', true, 'Medium sized conference room with projector', 'ACTIVE', '08:00:00', '20:00:00', '/images/facilities/conference.jpg'),
('Computer Lab 101', 'Engineering Building', 50, 'COMPUTER_LAB', true, 'Computer lab with 50 workstations', 'ACTIVE', '08:00:00', '21:00:00', '/images/facilities/lab.jpg'),
('Study Room 204', 'Library', 10, 'STUDY_ROOM', true, 'Quiet study room with whiteboard', 'ACTIVE', '08:00:00', '22:00:00', '/images/facilities/study.jpg'),
('Science Lab 305', 'Science Building', 25, 'LABORATORY', true, 'Fully equipped science laboratory', 'ACTIVE', '08:00:00', '18:00:00', '/images/facilities/science.jpg');

-- Populate bookings
INSERT INTO bookings (user_id, resource_id, start_time, end_time, purpose, status, remarks)
VALUES 
(3, 2, '2023-10-05 14:00:00', '2023-10-05 16:00:00', 'Faculty Meeting', 'COMPLETED', 'Semester planning meeting'),
(8, 4, '2023-10-06 10:00:00', '2023-10-06 12:00:00', 'Group Study', 'COMPLETED', 'CS101 project meeting'),
(5, 2, '2023-11-20 10:00:00', '2023-11-20 12:00:00', 'Department Meeting', 'SCHEDULED', 'Curriculum review'),
(6, 5, '2023-11-25 14:00:00', '2023-11-25 17:00:00', 'Physics Experiment', 'SCHEDULED', 'Advanced lab for physics students');

-- Populate cafeteria items
INSERT INTO cafeteria_items (name, description, price, category, available, quantity, image_url)
VALUES 
('Cheeseburger', 'Classic beef burger with cheese', 6.99, 'MAIN', true, 50, '/images/food/burger.jpg'),
('Vegetarian Pizza', 'Fresh vegetables on a thin crust', 8.99, 'MAIN', true, 30, '/images/food/pizza.jpg'),
('Caesar Salad', 'Romaine lettuce with dressing', 5.99, 'SIDE', true, 25, '/images/food/salad.jpg'),
('French Fries', 'Crispy golden fries', 2.99, 'SIDE', true, 100, '/images/food/fries.jpg'),
('Chocolate Milkshake', 'Rich chocolate shake', 3.99, 'BEVERAGE', true, 40, '/images/food/shake.jpg'),
('Cola', 'Refreshing soft drink', 1.99, 'BEVERAGE', true, 200, '/images/food/cola.jpg');

-- Populate cafeteria orders
INSERT INTO cafeteria_orders (user_id, order_time, total_amount, status, payment_method, payment_status, remarks)
VALUES 
(8, '2023-10-10 12:30:00', 13.97, 'COMPLETED', 'CREDIT_CARD', 'PAID', 'No onions please'),
(9, '2023-10-10 12:45:00', 14.97, 'COMPLETED', 'MOBILE_PAYMENT', 'PAID', NULL),
(10, '2023-10-11 13:15:00', 16.97, 'COMPLETED', 'CAMPUS_CARD', 'PAID', 'Extra sauce'),
(11, '2023-10-12 12:00:00', 10.98, 'COMPLETED', 'CASH', 'PAID', NULL);

-- Populate cafeteria order items
INSERT INTO cafeteria_order_items (order_id, item_id, quantity, price)
VALUES 
(1, 1, 1, 6.99),  -- Cheeseburger
(1, 4, 1, 2.99),  -- French Fries
(1, 6, 2, 1.99),  -- 2 Colas (price per item)

(2, 2, 1, 8.99),  -- Vegetarian Pizza
(2, 3, 1, 5.99),  -- Caesar Salad

(3, 1, 1, 6.99),  -- Cheeseburger
(3, 4, 1, 2.99),  -- French Fries
(3, 5, 1, 3.99),  -- Chocolate Milkshake
(3, 6, 2, 1.99),  -- 2 Colas (price per item)

(4, 3, 1, 5.99),  -- Caesar Salad
(4, 4, 1, 2.99),  -- French Fries
(4, 6, 1, 1.99);  -- Cola

-- Populate feedback
INSERT INTO feedback (user_id, subject, message, category, submission_time, status, response, response_time, priority)
VALUES 
(8, 'Library Hours', 'Can we extend library hours during finals week?', 'SUGGESTION', '2023-10-05 14:30:00', 'CLOSED', 'We have extended library hours until midnight during finals week.', '2023-10-10 09:15:00', 'MEDIUM'),
(9, 'Campus Wifi', 'Poor connectivity in the science building', 'COMPLAINT', '2023-10-12 10:45:00', 'IN_PROGRESS', NULL, NULL, 'HIGH'),
(10, 'Great CS Faculty', 'Professor Martinez is an excellent teacher!', 'PRAISE', '2023-10-20 15:30:00', 'CLOSED', 'Thank you for your feedback.', '2023-10-22 11:00:00', 'LOW');

-- Populate lost and found items
INSERT INTO lost_found_items (item_name, description, category, location_found, date_found, found_by, status, claimed_by, claim_date, image_url, verification_details)
VALUES 
('Backpack', 'Blue Backpack', 'PERSONAL_ITEM', 'Library', '2023-10-08 15:30:00', 16, 'CLAIMED', 8, '2023-10-09 10:15:00', '/images/lost/backpack.jpg', 'Has name tag inside'),
('Smartphone', 'iPhone 13', 'ELECTRONICS', 'Cafeteria', '2023-10-15 12:45:00', 17, 'CLAIMED', 9, '2023-10-15 14:30:00', '/images/lost/phone.jpg', 'Red case'),
('ID Card', 'Student ID Card', 'IDENTIFICATION', 'Bus Stop', '2023-11-10 08:15:00', 17, 'FOUND', NULL, NULL, '/images/lost/id.jpg', 'Name: Andrew Smith');

-- Populate resources (physical resources, not learning resources)
INSERT INTO resources (name, type, location, description, capacity, status, available)
VALUES 
('Lecture Hall A', 'CLASSROOM', 'Academic Building', 'Large lecture hall', 200, 'ACTIVE', true),
('Meeting Room 101', 'MEETING_ROOM', 'Admin Building', 'Small meeting room', 15, 'ACTIVE', true),
('Library Study Area', 'STUDY_SPACE', 'Main Library', 'Open study area', 80, 'ACTIVE', true),
('Physics Lab', 'LABORATORY', 'Science Building', 'Well-equipped physics lab', 30, 'ACTIVE', true),
('Computer Lab 1', 'COMPUTER_LAB', 'Engineering Building', 'Computer lab with workstations', 40, 'ACTIVE', true);

-- Populate visitor passes
INSERT INTO visitor_passes (visitor_name, visitor_email, visitor_phone, purpose, host_id, entry_time, exit_time, status, remarks, created_at)
VALUES 
('Janet Miller', 'jmiller@example.com', '555-123-4567', 'Guest Lecture', 3, '2023-10-15 09:30:00', '2023-10-15 12:30:00', 'COMPLETED', 'Spoke about AI advancements', '2023-10-12 10:00:00'),
('Michael Brown', 'mbrown@example.com', '555-234-5678', 'Campus Tour', 16, '2023-10-18 13:00:00', '2023-10-18 15:30:00', 'COMPLETED', 'Potential donor', '2023-10-15 14:00:00'),
('Sarah Lee', 'slee@example.com', '555-345-6789', 'Parent Visit', 10, '2023-11-05 10:00:00', NULL, 'SCHEDULED', 'Meeting with advisor', '2023-10-30 09:00:00'); 