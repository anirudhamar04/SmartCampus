package com.smartcampus.service;

import com.smartcampus.dto.CourseResourceDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Service interface for course resources
 */
public interface CourseResourceService {
    
    /**
     * Add a new resource to a course
     */
    CourseResourceDTO addResourceToCourse(Long courseId, String title, String description, 
                                         String resourceType, Long uploadedById, MultipartFile file);
    
    /**
     * Update an existing course resource
     */
    CourseResourceDTO updateCourseResource(Long resourceId, String title, String description, 
                                          String resourceType, MultipartFile file);
    
    /**
     * Delete a course resource
     */
    void deleteCourseResource(Long resourceId);
    
    /**
     * Get a course resource by ID
     */
    CourseResourceDTO getCourseResourceById(Long resourceId);
    
    /**
     * Get all resources for a course
     */
    List<CourseResourceDTO> getResourcesByCourse(Long courseId);
    
    /**
     * Get all resources for a teacher
     */
    List<CourseResourceDTO> getResourcesByTeacher(Long teacherId);
    
    /**
     * Get resources by course and type
     */
    List<CourseResourceDTO> getResourcesByType(Long courseId, String resourceType);
    
    /**
     * Download a resource
     */
    byte[] downloadResource(Long resourceId);
    
    /**
     * Get all available resource types
     */
    List<String> getResourceTypes();
    
    /**
     * Get all course resources
     */
    List<CourseResourceDTO> getAllCourseResources();
} 