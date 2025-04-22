package com.smartcampus.service;

import com.smartcampus.dto.CourseResourceDTO;
import com.smartcampus.model.Course;
import com.smartcampus.model.CourseResource;
import com.smartcampus.model.Resource;
import com.smartcampus.model.User;
import com.smartcampus.repository.CourseRepository;
import com.smartcampus.repository.CourseResourceRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CourseResourceServiceImpl implements CourseResourceService {

    @Value("${file.upload.directory:/server/courses}")
    private String uploadDirectory;
    
    private final CourseResourceRepository courseResourceRepository;
    private final CourseRepository courseRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    
    @Autowired
    public CourseResourceServiceImpl(CourseResourceRepository courseResourceRepository,
                                     CourseRepository courseRepository,
                                     ResourceRepository resourceRepository,
                                     UserRepository userRepository) {
        this.courseResourceRepository = courseResourceRepository;
        this.courseRepository = courseRepository;
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
    }
    
    @Override
    @Transactional
    public CourseResourceDTO addResourceToCourse(Long courseId, String title, String description, 
                                              String resourceType, Long uploadedById, MultipartFile file) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));
        
        User uploader = userRepository.findById(uploadedById)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + uploadedById));
        
        // Create a new resource
        Resource resource = new Resource();
        resource.setName(title);
        resource.setDescription(description);
        resource.setType("DOCUMENT");
        resource.setLocation("Server");
        resource.setCapacity(0);
        resource.setAvailable(true);
        resource.setStatus("AVAILABLE");
        
        Resource savedResource = resourceRepository.save(resource);
        
        // Save file to the server
        String courseCode = course.getCourseCode();
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        String directoryPath = uploadDirectory + "/" + courseCode;
        String filePath = directoryPath + "/" + fileName;
        
        File directory = new File(directoryPath);
        if (!directory.exists()) {
            directory.mkdirs();
        }
        
        try {
            Path path = Paths.get(filePath);
            Files.write(path, file.getBytes());
        } catch (IOException e) {
            throw new RuntimeException("Failed to save file: " + e.getMessage());
        }
        
        // Create a new course resource
        CourseResource courseResource = new CourseResource();
        courseResource.setCourse(course);
        courseResource.setResource(savedResource);
        courseResource.setFilePath(filePath);
        courseResource.setTitle(title);
        courseResource.setDescription(description);
        courseResource.setUploadDate(LocalDateTime.now());
        courseResource.setResourceType(resourceType);
        courseResource.setUploadedBy(uploader);
        
        CourseResource savedCourseResource = courseResourceRepository.save(courseResource);
        
        return convertToDTO(savedCourseResource);
    }
    
    @Override
    @Transactional
    public CourseResourceDTO updateCourseResource(Long resourceId, String title, String description, 
                                               String resourceType, MultipartFile file) {
        CourseResource courseResource = courseResourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Course resource not found with id: " + resourceId));
        
        courseResource.setTitle(title);
        courseResource.setDescription(description);
        courseResource.setResourceType(resourceType);
        
        Resource resource = courseResource.getResource();
        resource.setName(title);
        resource.setDescription(description);
        resourceRepository.save(resource);
        
        // Update file if provided
        if (file != null && !file.isEmpty()) {
            try {
                // Delete old file
                Path oldFilePath = Paths.get(courseResource.getFilePath());
                Files.deleteIfExists(oldFilePath);
                
                // Save new file
                String courseCode = courseResource.getCourse().getCourseCode();
                String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                String directoryPath = uploadDirectory + "/" + courseCode;
                String filePath = directoryPath + "/" + fileName;
                
                File directory = new File(directoryPath);
                if (!directory.exists()) {
                    directory.mkdirs();
                }
                
                Path path = Paths.get(filePath);
                Files.write(path, file.getBytes());
                
                courseResource.setFilePath(filePath);
            } catch (IOException e) {
                throw new RuntimeException("Failed to update file: " + e.getMessage());
            }
        }
        
        CourseResource updatedResource = courseResourceRepository.save(courseResource);
        
        return convertToDTO(updatedResource);
    }
    
    @Override
    @Transactional
    public void deleteCourseResource(Long resourceId) {
        CourseResource courseResource = courseResourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Course resource not found with id: " + resourceId));
        
        try {
            // Delete the file
            Path filePath = Paths.get(courseResource.getFilePath());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete file: " + e.getMessage());
        }
        
        // Delete the resource
        Resource resource = courseResource.getResource();
        courseResourceRepository.delete(courseResource);
        resourceRepository.delete(resource);
    }
    
    @Override
    public CourseResourceDTO getCourseResourceById(Long resourceId) {
        CourseResource courseResource = courseResourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Course resource not found with id: " + resourceId));
        
        return convertToDTO(courseResource);
    }
    
    @Override
    public List<CourseResourceDTO> getResourcesByCourse(Long courseId) {
        List<CourseResource> resources = courseResourceRepository.findByCourseId(courseId);
        return resources.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<CourseResourceDTO> getResourcesByTeacher(Long teacherId) {
        List<CourseResource> resources = courseResourceRepository.findResourcesByTeacherId(teacherId);
        return resources.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<CourseResourceDTO> getResourcesByType(Long courseId, String resourceType) {
        List<CourseResource> resources = courseResourceRepository.findByCourseIdAndResourceType(courseId, resourceType);
        return resources.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public byte[] downloadResource(Long resourceId) {
        CourseResource courseResource = courseResourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Course resource not found with id: " + resourceId));
        
        try {
            Path filePath = Paths.get(courseResource.getFilePath());
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file: " + e.getMessage());
        }
    }
    
    @Override
    public List<String> getResourceTypes() {
        return Arrays.asList("LECTURE_NOTES", "ASSIGNMENT", "SYLLABUS", "READING", "VIDEO", "EXERCISE", "OTHER");
    }
    
    @Override
    public List<CourseResourceDTO> getAllCourseResources() {
        List<CourseResource> resources = courseResourceRepository.findAll();
        return resources.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    private CourseResourceDTO convertToDTO(CourseResource courseResource) {
        CourseResourceDTO dto = new CourseResourceDTO();
        dto.setId(courseResource.getId());
        dto.setCourseId(courseResource.getCourse().getId());
        dto.setCourseName(courseResource.getCourse().getName());
        dto.setCourseCode(courseResource.getCourse().getCourseCode());
        dto.setResourceId(courseResource.getResource().getId());
        dto.setResourceName(courseResource.getResource().getName());
        dto.setFilePath(courseResource.getFilePath());
        dto.setTitle(courseResource.getTitle());
        dto.setDescription(courseResource.getDescription());
        dto.setUploadDate(courseResource.getUploadDate());
        dto.setResourceType(courseResource.getResourceType());
        
        if (courseResource.getUploadedBy() != null) {
            dto.setUploadedById(courseResource.getUploadedBy().getId());
            dto.setUploadedByName(courseResource.getUploadedBy().getFullName());
        }
        
        // Generate a download URL for the resource
        dto.setFileUrl("/api/course-resources/download/" + courseResource.getId());
        
        return dto;
    }
} 