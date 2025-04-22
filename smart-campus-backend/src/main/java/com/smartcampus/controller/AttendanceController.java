package com.smartcampus.controller;

import com.smartcampus.dto.AttendanceDTO;
import com.smartcampus.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @Autowired
    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    // Create attendance - Only Admin and Faculty can create attendance
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('FACULTY')")
    public ResponseEntity<AttendanceDTO> createAttendance(@RequestBody AttendanceDTO attendanceDTO) {
        AttendanceDTO createdAttendance = attendanceService.createAttendance(attendanceDTO);
        return ResponseEntity.ok(createdAttendance);
    }

    // Update attendance - Only Admin and Faculty can update attendance
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FACULTY')")
    public ResponseEntity<AttendanceDTO> updateAttendance(
            @PathVariable Long id,
            @RequestBody AttendanceDTO attendanceDTO) {
        AttendanceDTO updatedAttendance = attendanceService.updateAttendance(id, attendanceDTO);
        return ResponseEntity.ok(updatedAttendance);
    }

    // Get attendance by ID - Accessible to all authenticated users
    @GetMapping("/{id}")
    public ResponseEntity<AttendanceDTO> getAttendanceById(@PathVariable Long id) {
        AttendanceDTO attendance = attendanceService.getAttendanceById(id);
        return ResponseEntity.ok(attendance);
    }

    // Get attendance by student - Accessible to all authenticated users
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<AttendanceDTO>> getAttendanceByStudent(@PathVariable Long studentId) {
        List<AttendanceDTO> attendanceList = attendanceService.getAttendanceByStudent(studentId);
        return ResponseEntity.ok(attendanceList);
    }

    // Get attendance by course - Accessible to all authenticated users
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<AttendanceDTO>> getAttendanceByCourse(@PathVariable Long courseId) {
        List<AttendanceDTO> attendanceList = attendanceService.getAttendanceByCourse(courseId);
        return ResponseEntity.ok(attendanceList);
    }

    // Get attendance by student and course - Accessible to all authenticated users
    @GetMapping("/student/{studentId}/course/{courseId}")
    public ResponseEntity<List<AttendanceDTO>> getAttendanceByStudentAndCourse(
            @PathVariable Long studentId,
            @PathVariable Long courseId) {
        List<AttendanceDTO> attendanceList = attendanceService.getAttendanceByStudentAndCourse(studentId, courseId);
        return ResponseEntity.ok(attendanceList);
    }

    // Get attendance by date range - Accessible to all authenticated users
    @GetMapping("/date-range")
    public ResponseEntity<List<AttendanceDTO>> getAttendanceByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        List<AttendanceDTO> attendanceList = attendanceService.getAttendanceByDateRange(start, end);
        return ResponseEntity.ok(attendanceList);
    }

    // Get attendance by course and date range - Accessible to all authenticated users
    @GetMapping("/course/{courseId}/date-range")
    public ResponseEntity<List<AttendanceDTO>> getAttendanceByCourseAndDateRange(
            @PathVariable Long courseId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        List<AttendanceDTO> attendanceList = attendanceService.getAttendanceByCourseAndDateRange(courseId, start, end);
        return ResponseEntity.ok(attendanceList);
    }

    // Get attendance by teacher - Accessible to all authenticated users
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<AttendanceDTO>> getAttendanceByTeacher(@PathVariable Long teacherId) {
        List<AttendanceDTO> attendanceList = attendanceService.getAttendanceByTeacher(teacherId);
        return ResponseEntity.ok(attendanceList);
    }

    // Bulk create attendance - Only Admin and Faculty can bulk create attendance
    @PostMapping("/bulk")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FACULTY')")
    public ResponseEntity<Void> bulkCreateAttendance(
            @RequestParam Long courseId,
            @RequestParam List<Long> studentIds,
            @RequestParam String status,
            @RequestParam(required = false) String remarks,
            @RequestParam Long teacherId) {
        attendanceService.bulkCreateAttendance(courseId, studentIds, status, remarks, teacherId);
        return ResponseEntity.ok().build();
    }

    // Get attendance percentage for a student in a course
    @GetMapping("/student/{studentId}/course/{courseId}/percentage")
    public ResponseEntity<Map<String, Object>> getAttendancePercentage(
            @PathVariable Long studentId,
            @PathVariable Long courseId) {
        List<AttendanceDTO> attendanceList = attendanceService.getAttendanceByStudentAndCourse(studentId, courseId);
        
        int totalClasses = attendanceList.size();
        long presentCount = attendanceList.stream()
                .filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus()))
                .count();
        
        double percentage = totalClasses > 0 ? ((double) presentCount / totalClasses) * 100 : 0;
        
        Map<String, Object> response = Map.of(
                "studentId", studentId,
                "courseId", courseId,
                "totalClasses", totalClasses,
                "attendedClasses", presentCount,
                "percentage", Math.round(percentage * 100.0) / 100.0 // Round to 2 decimal places
        );
        
        return ResponseEntity.ok(response);
    }
    
    // Get overall attendance percentage for a student across all courses
    @GetMapping("/student/{studentId}/overall-percentage")
    public ResponseEntity<Map<String, Object>> getOverallAttendancePercentage(
            @PathVariable Long studentId) {
        List<AttendanceDTO> attendanceList = attendanceService.getAttendanceByStudent(studentId);
        
        int totalClasses = attendanceList.size();
        long presentCount = attendanceList.stream()
                .filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus()))
                .count();
        
        double percentage = totalClasses > 0 ? ((double) presentCount / totalClasses) * 100 : 0;
        
        Map<String, Object> response = Map.of(
                "studentId", studentId,
                "totalClasses", totalClasses,
                "attendedClasses", presentCount,
                "percentage", Math.round(percentage * 100.0) / 100.0 // Round to 2 decimal places
        );
        
        return ResponseEntity.ok(response);
    }
} 