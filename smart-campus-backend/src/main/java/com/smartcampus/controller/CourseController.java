package com.smartcampus.controller;

import com.smartcampus.dto.CourseDTO;
import com.smartcampus.dto.UserDTO;
import com.smartcampus.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;

    @Autowired
    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    // Create a new course - Only Admin and Faculty can create courses
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('FACULTY')")
    public ResponseEntity<CourseDTO> createCourse(@RequestBody CourseDTO courseDTO) {
        CourseDTO createdCourse = courseService.createCourse(courseDTO);
        return ResponseEntity.ok(createdCourse);
    }

    // Update a course - Only Admin and Faculty can update courses
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FACULTY')")
    public ResponseEntity<CourseDTO> updateCourse(
            @PathVariable Long id,
            @RequestBody CourseDTO courseDTO) {
        CourseDTO updatedCourse = courseService.updateCourse(id, courseDTO);
        return ResponseEntity.ok(updatedCourse);
    }

    // Get a course by ID - Accessible to all authenticated users
    @GetMapping("/{id}")
    public ResponseEntity<CourseDTO> getCourseById(@PathVariable Long id) {
        CourseDTO course = courseService.getCourseById(id);
        return ResponseEntity.ok(course);
    }

    // Get all courses - Accessible to all authenticated users
    @GetMapping
    public ResponseEntity<List<CourseDTO>> getAllCourses() {
        List<CourseDTO> courses = courseService.getAllCourses();
        return ResponseEntity.ok(courses);
    }

    // Get courses by teacher - Accessible to all authenticated users
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<CourseDTO>> getCoursesByTeacher(@PathVariable Long teacherId) {
        List<CourseDTO> courses = courseService.getCoursesByTeacher(teacherId);
        return ResponseEntity.ok(courses);
    }

    // Get courses for the currently logged-in faculty member
    @GetMapping("/my-courses")
    public ResponseEntity<List<CourseDTO>> getMyAssignedCourses() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        // Check if user is a faculty member
        if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_FACULTY"))) {
            List<CourseDTO> courses = courseService.getCoursesByFacultyUsername(username);
            return ResponseEntity.ok(courses);
        } 
        // If user is a student
        else if (auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT"))) {
            List<CourseDTO> courses = courseService.getCoursesByStudentUsername(username);
            return ResponseEntity.ok(courses);
        }
        
        return ResponseEntity.ok(List.of()); // Empty list if not faculty or student
    }

    // Get students enrolled in all courses taught by the currently logged-in faculty
    @GetMapping("/my-students")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<Map<String, List<UserDTO>>> getMyStudents() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        Map<String, List<UserDTO>> courseStudentsMap = courseService.getStudentsByCourseForFaculty(username);
        return ResponseEntity.ok(courseStudentsMap);
    }

    // Get all students enrolled in a specific course by course ID
    @GetMapping("/{courseId}/students")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FACULTY')")
    public ResponseEntity<List<UserDTO>> getStudentsByCourse(@PathVariable Long courseId) {
        CourseDTO course = courseService.getCourseById(courseId);
        return ResponseEntity.ok(course.getEnrolledStudents());
    }

    // Get courses by student - Accessible to all authenticated users
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<CourseDTO>> getCoursesByStudent(@PathVariable Long studentId) {
        List<CourseDTO> courses = courseService.getCoursesByStudent(studentId);
        return ResponseEntity.ok(courses);
    }

    // Enroll a student - Only Admin and Faculty can enroll students
    @PostMapping("/{courseId}/students/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FACULTY')")
    public ResponseEntity<CourseDTO> enrollStudent(
            @PathVariable Long courseId,
            @PathVariable Long studentId) {
        CourseDTO course = courseService.enrollStudent(courseId, studentId);
        return ResponseEntity.ok(course);
    }

    // Unenroll a student - Only Admin and Faculty can unenroll students
    @DeleteMapping("/{courseId}/students/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FACULTY')")
    public ResponseEntity<CourseDTO> unenrollStudent(
            @PathVariable Long courseId,
            @PathVariable Long studentId) {
        CourseDTO course = courseService.unenrollStudent(courseId, studentId);
        return ResponseEntity.ok(course);
    }

    // Assign a teacher - Only Admin can assign teachers
    @PostMapping("/{courseId}/teachers/{teacherId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CourseDTO> assignTeacher(
            @PathVariable Long courseId,
            @PathVariable Long teacherId) {
        CourseDTO course = courseService.assignTeacher(courseId, teacherId);
        return ResponseEntity.ok(course);
    }

    // Remove a teacher - Only Admin can remove teachers
    @DeleteMapping("/{courseId}/teachers/{teacherId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CourseDTO> removeTeacher(
            @PathVariable Long courseId,
            @PathVariable Long teacherId) {
        CourseDTO course = courseService.removeTeacher(courseId, teacherId);
        return ResponseEntity.ok(course);
    }
} 