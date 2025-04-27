-- Create course_resources table if it doesn't exist
CREATE TABLE IF NOT EXISTS course_resources (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    course_id BIGINT NOT NULL,
    resource_id BIGINT NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resource_type VARCHAR(50) NOT NULL, -- LECTURE_NOTES, ASSIGNMENT, SYLLABUS, READING, VIDEO, EXERCISE, OTHER
    uploaded_by BIGINT,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Add resources for each course
INSERT INTO resources (name, description, type, location, capacity, available, status) VALUES
('CS101 Syllabus', 'Course syllabus for Introduction to Computer Science', 'DOCUMENT', 'Server', 0, true, 'AVAILABLE'),
('CS101 Lecture Notes', 'Compilation of lecture notes for CS101', 'DOCUMENT', 'Server', 0, true, 'AVAILABLE'),
('CS101 Programming Examples', 'Code examples for programming assignments', 'DOCUMENT', 'Server', 0, true, 'AVAILABLE'),
('CS102 Data Structures Guide', 'Comprehensive guide to basic data structures', 'DOCUMENT', 'Server', 0, true, 'AVAILABLE'),
('CS102 Algorithm Implementations', 'Example implementations of key algorithms', 'DOCUMENT', 'Server', 0, true, 'AVAILABLE'),
('MATH101 Calculus Formulas', 'Reference sheet for calculus formulas', 'DOCUMENT', 'Server', 0, true, 'AVAILABLE'),
('MATH101 Practice Problems', 'Collection of practice problems for Calculus I', 'DOCUMENT', 'Server', 0, true, 'AVAILABLE'),
('PHYS201 Lab Materials', 'Materials required for physics lab sessions', 'DOCUMENT', 'Server', 0, true, 'AVAILABLE'),
('ENG101 Writing Guide', 'Guide to effective academic writing', 'DOCUMENT', 'Server', 0, true, 'AVAILABLE'),
('PSYCH101 Case Studies', 'Collection of psychology case studies', 'DOCUMENT', 'Server', 0, true, 'AVAILABLE');

-- Link resources to courses (assuming user with ID 1 is a teacher)
INSERT INTO course_resources (course_id, resource_id, file_path, title, description, resource_type, uploaded_by) VALUES
-- CS101 Resources
(1, 1, '/server/courses/CS101/syllabus.pdf', 'Course Syllabus', 'Complete syllabus for Introduction to Computer Science', 'SYLLABUS', 1),
(1, 2, '/server/courses/CS101/lecture_notes.pdf', 'Lecture Notes Compilation', 'All lecture notes for the semester', 'LECTURE_NOTES', 1),
(1, 3, '/server/courses/CS101/code_examples.zip', 'Programming Examples', 'Example code from lectures', 'EXERCISE', 1),

-- CS102 Resources
(2, 4, '/server/courses/CS102/data_structures_guide.pdf', 'Data Structures Guide', 'Comprehensive guide to all data structures covered in class', 'READING', 1),
(2, 5, '/server/courses/CS102/algorithm_examples.zip', 'Algorithm Implementations', 'Sample code implementing various algorithms', 'EXERCISE', 1),

-- MATH101 Resources
(3, 6, '/server/courses/MATH101/calculus_formulas.pdf', 'Calculus Formula Reference', 'Quick reference for all calculus formulas', 'READING', 1),
(3, 7, '/server/courses/MATH101/practice_problems.pdf', 'Practice Problem Set', 'Additional practice problems with solutions', 'EXERCISE', 1),

-- PHYS201 Resources
(4, 8, '/server/courses/PHYS201/lab_materials.pdf', 'Physics Lab Guide', 'Instructions and materials for all lab sessions', 'READING', 1),

-- ENG101 Resources
(5, 9, '/server/courses/ENG101/writing_guide.pdf', 'Academic Writing Style Guide', 'Guidelines for effective academic writing', 'READING', 1),

-- PSYCH101 Resources
(6, 10, '/server/courses/PSYCH101/case_studies.pdf', 'Psychology Case Studies', 'Collection of interesting psychology case studies', 'READING', 1); 