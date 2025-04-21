package com.smartcampus.service;

import com.smartcampus.dto.AttendanceDTO;
import com.smartcampus.model.Attendance;
import com.smartcampus.model.Course;
import com.smartcampus.model.User;
import com.smartcampus.repository.AttendanceRepository;
import com.smartcampus.repository.CourseRepository;
import com.smartcampus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    @Autowired
    public AttendanceService(AttendanceRepository attendanceRepository, 
                           UserRepository userRepository,
                           CourseRepository courseRepository) {
        this.attendanceRepository = attendanceRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
    }

    @Transactional
    public AttendanceDTO createAttendance(AttendanceDTO attendanceDTO) {
        User student = userRepository.findById(attendanceDTO.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        Course course = courseRepository.findById(attendanceDTO.getCourseId())
                .orElseThrow(() -> new RuntimeException("Course not found"));
        
        // Check if the student is enrolled in the course
        if (!course.getEnrolledStudents().contains(student)) {
            throw new RuntimeException("Student is not enrolled in this course");
        }
        
        User teacher = null;
        if (attendanceDTO.getRecordedById() != null) {
            teacher = userRepository.findById(attendanceDTO.getRecordedById())
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));
        }

        Attendance attendance = new Attendance();
        attendance.setStudent(student);
        attendance.setCourse(course);
        attendance.setDate(attendanceDTO.getDate());
        attendance.setStatus(attendanceDTO.getStatus());
        attendance.setRemarks(attendanceDTO.getRemarks());
        attendance.setRecordedBy(teacher);
        attendance.setRecordedAt(LocalDateTime.now());

        Attendance savedAttendance = attendanceRepository.save(attendance);
        return convertToDTO(savedAttendance);
    }

    @Transactional
    public AttendanceDTO updateAttendance(Long id, AttendanceDTO attendanceDTO) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attendance not found"));
        
        // Update the status and remarks
        attendance.setStatus(attendanceDTO.getStatus());
        attendance.setRemarks(attendanceDTO.getRemarks());
        
        // Update the date if provided
        if (attendanceDTO.getDate() != null) {
            attendance.setDate(attendanceDTO.getDate());
        }
        
        // Update the student if ID is provided and different
        if (attendanceDTO.getStudentId() != null && !attendanceDTO.getStudentId().equals(attendance.getStudent().getId())) {
            User student = userRepository.findById(attendanceDTO.getStudentId())
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            attendance.setStudent(student);
        }
        
        // Update the course if ID is provided and different
        if (attendanceDTO.getCourseId() != null && !attendanceDTO.getCourseId().equals(attendance.getCourse().getId())) {
            Course course = courseRepository.findById(attendanceDTO.getCourseId())
                    .orElseThrow(() -> new RuntimeException("Course not found"));
            attendance.setCourse(course);
        }
        
        // Update the teacher who recorded this attendance
        if (attendanceDTO.getRecordedById() != null) {
            User teacher = userRepository.findById(attendanceDTO.getRecordedById())
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));
            attendance.setRecordedBy(teacher);
            attendance.setRecordedAt(LocalDateTime.now());
        }

        Attendance updatedAttendance = attendanceRepository.save(attendance);
        return convertToDTO(updatedAttendance);
    }

    public AttendanceDTO getAttendanceById(Long id) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attendance not found"));
        return convertToDTO(attendance);
    }

    public List<AttendanceDTO> getAttendanceByStudent(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        return attendanceRepository.findByStudent(student).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<AttendanceDTO> getAttendanceByCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        return attendanceRepository.findByCourse(course).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<AttendanceDTO> getAttendanceByStudentAndCourse(Long studentId, Long courseId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        return attendanceRepository.findByStudentAndCourse(student, course).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<AttendanceDTO> getAttendanceByDateRange(LocalDateTime start, LocalDateTime end) {
        return attendanceRepository.findByDateBetween(start, end).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<AttendanceDTO> getAttendanceByCourseAndDateRange(Long courseId, LocalDateTime start, LocalDateTime end) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        return attendanceRepository.findByCourseAndDateBetween(course, start, end).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<AttendanceDTO> getAttendanceByTeacher(Long teacherId) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        return attendanceRepository.findByRecordedBy(teacher).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void bulkCreateAttendance(Long courseId, List<Long> studentIds, String status, String remarks, Long teacherId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        
        LocalDateTime now = LocalDateTime.now();
        // Adjust date to start of day for consistent comparison
        LocalDateTime dateOnly = LocalDateTime.of(now.getYear(), now.getMonth(), now.getDayOfMonth(), 0, 0, 0);
        
        List<Attendance> attendancesToSave = studentIds.stream().map(studentId -> {
            User student = userRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found with ID: " + studentId));
            
            // Check if there's already an attendance record for this student, course, and day
            List<Attendance> existingAttendances = attendanceRepository.findByStudentAndCourse(student, course);
            
            // Filter attendance records for today
            Attendance existingToday = existingAttendances.stream()
                .filter(a -> isSameDay(a.getDate(), dateOnly))
                .findFirst()
                .orElse(null);
            
            if (existingToday != null) {
                // Update existing attendance record
                existingToday.setStatus(status);
                existingToday.setRemarks(remarks);
                existingToday.setRecordedBy(teacher);
                existingToday.setRecordedAt(now);
                return existingToday;
            } else {
                // Create new attendance record
                Attendance attendance = new Attendance();
                attendance.setStudent(student);
                attendance.setCourse(course);
                attendance.setDate(now);
                attendance.setStatus(status);
                attendance.setRemarks(remarks);
                attendance.setRecordedBy(teacher);
                attendance.setRecordedAt(now);
                return attendance;
            }
        }).collect(Collectors.toList());
        
        attendanceRepository.saveAll(attendancesToSave);
    }
    
    // Helper method to check if two datetime objects represent the same day
    private boolean isSameDay(LocalDateTime date1, LocalDateTime date2) {
        return date1.getYear() == date2.getYear() &&
               date1.getMonth() == date2.getMonth() &&
               date1.getDayOfMonth() == date2.getDayOfMonth();
    }

    private AttendanceDTO convertToDTO(Attendance attendance) {
        AttendanceDTO dto = new AttendanceDTO();
        dto.setId(attendance.getId());
        dto.setStudentId(attendance.getStudent().getId());
        dto.setStudentName(attendance.getStudent().getFullName());
        dto.setCourseId(attendance.getCourse().getId());
        dto.setCourseName(attendance.getCourse().getName());
        dto.setCourseCode(attendance.getCourse().getCourseCode());
        dto.setDate(attendance.getDate());
        dto.setStatus(attendance.getStatus());
        dto.setRemarks(attendance.getRemarks());
        
        if (attendance.getRecordedBy() != null) {
            dto.setRecordedById(attendance.getRecordedBy().getId());
            dto.setRecordedByName(attendance.getRecordedBy().getFullName());
        }
        
        dto.setRecordedAt(attendance.getRecordedAt());
        
        return dto;
    }
} 