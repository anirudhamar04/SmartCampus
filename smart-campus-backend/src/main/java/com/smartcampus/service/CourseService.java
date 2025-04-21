package com.smartcampus.service;

import com.smartcampus.dto.CourseDTO;
import com.smartcampus.dto.UserDTO;
import com.smartcampus.model.Course;
import com.smartcampus.model.Role;
import com.smartcampus.model.User;
import com.smartcampus.repository.CourseRepository;
import com.smartcampus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    @Autowired
    public CourseService(CourseRepository courseRepository, UserRepository userRepository) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public CourseDTO createCourse(CourseDTO courseDTO) {
        Course course = new Course();
        course.setName(courseDTO.getName());
        course.setCourseCode(courseDTO.getCourseCode());
        course.setDescription(courseDTO.getDescription());
        course.setDepartment(courseDTO.getDepartment());
        course.setCredits(courseDTO.getCredits());
        course.setSemester(courseDTO.getSemester());
        course.setStartDate(courseDTO.getStartDate());
        course.setEndDate(courseDTO.getEndDate());
        course.setCapacity(courseDTO.getCapacity());
        course.setLocation(courseDTO.getLocation());
        course.setSchedule(courseDTO.getSchedule());
        
        Course savedCourse = courseRepository.save(course);
        return convertToDTO(savedCourse);
    }

    @Transactional
    public CourseDTO updateCourse(Long id, CourseDTO courseDTO) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        
        course.setName(courseDTO.getName());
        course.setCourseCode(courseDTO.getCourseCode());
        course.setDescription(courseDTO.getDescription());
        course.setDepartment(courseDTO.getDepartment());
        course.setCredits(courseDTO.getCredits());
        course.setSemester(courseDTO.getSemester());
        course.setStartDate(courseDTO.getStartDate());
        course.setEndDate(courseDTO.getEndDate());
        course.setCapacity(courseDTO.getCapacity());
        course.setLocation(courseDTO.getLocation());
        course.setSchedule(courseDTO.getSchedule());
        
        Course updatedCourse = courseRepository.save(course);
        return convertToDTO(updatedCourse);
    }

    public CourseDTO getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        return convertToDTO(course);
    }

    public List<CourseDTO> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<CourseDTO> getCoursesByTeacher(Long teacherId) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        return courseRepository.findByAssignedTeachers(teacher).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<CourseDTO> getCoursesByFacultyUsername(String username) {
        User faculty = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));
        
        // Verify the user is a faculty member
        if (faculty.getRole() != Role.FACULTY) {
            throw new RuntimeException("User is not a faculty member");
        }
        
        return courseRepository.findByAssignedTeachers(faculty).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public Map<String, List<UserDTO>> getStudentsByCourseForFaculty(String username) {
        User faculty = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));
        
        // Verify the user is a faculty member
        if (faculty.getRole() != Role.FACULTY) {
            throw new RuntimeException("User is not a faculty member");
        }
        
        // Get all courses taught by this faculty
        List<Course> facultyCourses = courseRepository.findByAssignedTeachers(faculty);
        
        // Create a map of course name/code to list of enrolled students
        Map<String, List<UserDTO>> courseStudentsMap = new HashMap<>();
        
        for (Course course : facultyCourses) {
            String courseKey = course.getCourseCode() + " - " + course.getName();
            List<UserDTO> studentDTOs = course.getEnrolledStudents().stream()
                    .map(this::convertUserToDTO)
                    .collect(Collectors.toList());
            courseStudentsMap.put(courseKey, studentDTOs);
        }
        
        return courseStudentsMap;
    }

    public List<CourseDTO> getCoursesByStudent(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        return courseRepository.findByEnrolledStudents(student).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CourseDTO enrollStudent(Long courseId, Long studentId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        course.addStudent(student);
        Course updatedCourse = courseRepository.save(course);
        return convertToDTO(updatedCourse);
    }

    @Transactional
    public CourseDTO unenrollStudent(Long courseId, Long studentId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        course.removeStudent(student);
        Course updatedCourse = courseRepository.save(course);
        return convertToDTO(updatedCourse);
    }

    @Transactional
    public CourseDTO assignTeacher(Long courseId, Long teacherId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        
        course.addTeacher(teacher);
        Course updatedCourse = courseRepository.save(course);
        return convertToDTO(updatedCourse);
    }

    @Transactional
    public CourseDTO removeTeacher(Long courseId, Long teacherId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        
        course.removeTeacher(teacher);
        Course updatedCourse = courseRepository.save(course);
        return convertToDTO(updatedCourse);
    }

    private CourseDTO convertToDTO(Course course) {
        CourseDTO dto = new CourseDTO();
        dto.setId(course.getId());
        dto.setName(course.getName());
        dto.setCourseCode(course.getCourseCode());
        dto.setDescription(course.getDescription());
        dto.setDepartment(course.getDepartment());
        dto.setCredits(course.getCredits());
        dto.setSemester(course.getSemester());
        dto.setStartDate(course.getStartDate());
        dto.setEndDate(course.getEndDate());
        dto.setCapacity(course.getCapacity());
        dto.setLocation(course.getLocation());
        dto.setSchedule(course.getSchedule());
        dto.setEnrollmentCount(course.getEnrolledStudents().size());
        
        // Convert students and teachers to DTOs (can be expensive for large sets)
        // In real applications, you might want to lazy load these or page them
        if (!course.getEnrolledStudents().isEmpty()) {
            dto.setEnrolledStudents(course.getEnrolledStudents().stream()
                    .map(this::convertUserToDTO)
                    .collect(Collectors.toList()));
        }
        
        if (!course.getAssignedTeachers().isEmpty()) {
            dto.setAssignedTeachers(course.getAssignedTeachers().stream()
                    .map(this::convertUserToDTO)
                    .collect(Collectors.toList()));
        }
        
        return dto;
    }

    private UserDTO convertUserToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().toString());
        return dto;
    }
} 