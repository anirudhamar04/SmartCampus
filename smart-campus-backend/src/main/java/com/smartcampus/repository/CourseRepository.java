package com.smartcampus.repository;

import com.smartcampus.model.Course;
import com.smartcampus.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByEnrolledStudents(User student);
    List<Course> findByAssignedTeachers(User teacher);
    List<Course> findBySemester(String semester);
    List<Course> findByDepartment(String department);
    List<Course> findByCourseCodeContainingIgnoreCase(String courseCode);
    List<Course> findByNameContainingIgnoreCase(String name);
} 