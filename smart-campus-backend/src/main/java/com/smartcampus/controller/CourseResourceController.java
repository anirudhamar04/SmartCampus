package com.smartcampus.controller;

import com.smartcampus.dto.CourseResourceDTO;
import com.smartcampus.dto.CourseDTO;
import com.smartcampus.service.CourseResourceService;
import com.smartcampus.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/course-resources")
@CrossOrigin(origins = "http://localhost:3000", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}, allowedHeaders = "*", allowCredentials = "true")
public class CourseResourceController {

    private final CourseResourceService courseResourceService;
    private final CourseService courseService;

    @Autowired
    public CourseResourceController(CourseResourceService courseResourceService, CourseService courseService) {
        this.courseResourceService = courseResourceService;
        this.courseService = courseService;
    }

    @PostMapping
    public ResponseEntity<CourseResourceDTO> addResourceToCourse(
            @RequestParam("courseId") Long courseId,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("resourceType") String resourceType,
            @RequestParam("uploadedById") Long uploadedById,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        
        CourseResourceDTO resource = courseResourceService.addResourceToCourse(
                courseId, title, description, resourceType, uploadedById, file);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(resource);
    }

    @PutMapping("/{resourceId}")
    public ResponseEntity<CourseResourceDTO> updateCourseResource(
            @PathVariable Long resourceId,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("resourceType") String resourceType,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        
        CourseResourceDTO resource = courseResourceService.updateCourseResource(
                resourceId, title, description, resourceType, file);
        
        return ResponseEntity.ok(resource);
    }

    @DeleteMapping("/{resourceId}")
    public ResponseEntity<Void> deleteCourseResource(@PathVariable Long resourceId) {
        courseResourceService.deleteCourseResource(resourceId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{resourceId}")
    public ResponseEntity<CourseResourceDTO> getCourseResourceById(@PathVariable Long resourceId) {
        CourseResourceDTO resource = courseResourceService.getCourseResourceById(resourceId);
        return ResponseEntity.ok(resource);
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<CourseResourceDTO>> getResourcesByCourse(@PathVariable Long courseId) {
        List<CourseResourceDTO> resources = courseResourceService.getResourcesByCourse(courseId);
        return ResponseEntity.ok(resources);
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<CourseResourceDTO>> getResourcesByTeacher(@PathVariable Long teacherId) {
        List<CourseResourceDTO> resources = courseResourceService.getResourcesByTeacher(teacherId);
        return ResponseEntity.ok(resources);
    }

    @GetMapping("/course/{courseId}/type/{resourceType}")
    public ResponseEntity<List<CourseResourceDTO>> getResourcesByType(
            @PathVariable Long courseId, @PathVariable String resourceType) {
        List<CourseResourceDTO> resources = courseResourceService.getResourcesByType(courseId, resourceType);
        return ResponseEntity.ok(resources);
    }

    @GetMapping("/download/{resourceId}")
    public ResponseEntity<byte[]> downloadResource(@PathVariable Long resourceId) {
        CourseResourceDTO resource = courseResourceService.getCourseResourceById(resourceId);
        byte[] fileContent = courseResourceService.downloadResource(resourceId);
        
        HttpHeaders headers = new HttpHeaders();
        
        // Handle different types of resources
        if (resource.getFilePath() != null) {
            if (resource.getFilePath().startsWith("LINK:")) {
                // For links, set content type to text/plain
                headers.setContentType(MediaType.TEXT_PLAIN);
                headers.setContentDispositionFormData("attachment", "link.txt");
            } else if (resource.getFilePath().equals("NO_FILE")) {
                // For resources without files, return empty content
                headers.setContentType(MediaType.TEXT_PLAIN);
                headers.setContentDispositionFormData("attachment", "no_content.txt");
            } else {
                // For regular files, extract filename and set appropriate headers
                String filename = resource.getFilePath().substring(resource.getFilePath().lastIndexOf('/') + 1);
                headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
                headers.setContentDispositionFormData("attachment", filename);
            }
        } else {
            // Default if filepath is null
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", "resource_" + resourceId);
        }
        
        return new ResponseEntity<>(fileContent, headers, HttpStatus.OK);
    }

    @GetMapping("/resource-types")
    public ResponseEntity<List<String>> getResourceTypes() {
        List<String> resourceTypes = courseResourceService.getResourceTypes();
        return ResponseEntity.ok(resourceTypes);
    }
    
    @GetMapping("/all")
    public ResponseEntity<List<CourseResourceDTO>> getAllCourseResources() {
        List<CourseResourceDTO> resources = courseResourceService.getAllCourseResources();
        return ResponseEntity.ok(resources);
    }
    
    @GetMapping("/teacher/{teacherId}/courses")
    public ResponseEntity<List<Object>> getTeacherCourses(@PathVariable Long teacherId) {
        return ResponseEntity.ok(courseService.getTeacherCourses(teacherId));
    }
} 