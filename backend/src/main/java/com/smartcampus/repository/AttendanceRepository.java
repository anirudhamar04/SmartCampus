package com.smartcampus.repository;

import com.smartcampus.model.Attendance;
import com.smartcampus.model.Course;
import com.smartcampus.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudent(User student);
    List<Attendance> findByCourse(Course course);
    List<Attendance> findByStudentAndCourse(User student, Course course);
    List<Attendance> findByDateBetween(LocalDateTime start, LocalDateTime end);
    List<Attendance> findByCourseAndDateBetween(Course course, LocalDateTime start, LocalDateTime end);
    List<Attendance> findByStudentAndDateBetween(User student, LocalDateTime start, LocalDateTime end);
    List<Attendance> findByStudentAndCourseAndDateBetween(User student, Course course, LocalDateTime start, LocalDateTime end);
    List<Attendance> findByCourseAndStatus(Course course, String status);
    List<Attendance> findByStudentAndStatus(User student, String status);
    List<Attendance> findByRecordedBy(User teacher);
} 