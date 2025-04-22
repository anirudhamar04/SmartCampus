package com.smartcampus.service;

import com.smartcampus.dto.CourseResourceDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CourseResourceService {
    
    CourseResourceDTO addResourceToCourse(Long courseId, String title, String description, 
                                         String resourceType, Long uploadedById, MultipartFile file);
    
    CourseResourceDTO updateCourseResource(Long resourceId, String title, String description, 
                                          String resourceType, MultipartFile file);
    
    void deleteCourseResource(Long resourceId);
    
    CourseResourceDTO getCourseResourceById(Long resourceId);
    
    List<CourseResourceDTO> getResourcesByCourse(Long courseId);
    
    List<CourseResourceDTO> getResourcesByTeacher(Long teacherId);
    
    List<CourseResourceDTO> getResourcesByType(Long courseId, String resourceType);
    
    byte[] downloadResource(Long resourceId);
    
    List<String> getResourceTypes();
    
    List<CourseResourceDTO> getAllCourseResources();
} 