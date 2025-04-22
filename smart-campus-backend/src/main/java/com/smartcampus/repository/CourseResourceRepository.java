package com.smartcampus.repository;

import com.smartcampus.model.Course;
import com.smartcampus.model.CourseResource;
import com.smartcampus.model.Resource;
import com.smartcampus.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseResourceRepository extends JpaRepository<CourseResource, Long> {
    
    List<CourseResource> findByCourse(Course course);
    
    List<CourseResource> findByCourseId(Long courseId);
    
    List<CourseResource> findByResource(Resource resource);
    
    List<CourseResource> findByResourceId(Long resourceId);
    
    List<CourseResource> findByUploadedBy(User teacher);
    
    List<CourseResource> findByUploadedById(Long teacherId);
    
    List<CourseResource> findByResourceType(String resourceType);
    
    @Query("SELECT cr FROM CourseResource cr JOIN cr.course c JOIN c.assignedTeachers t WHERE t.id = :teacherId")
    List<CourseResource> findResourcesByTeacherId(Long teacherId);
    
    @Query("SELECT cr FROM CourseResource cr JOIN cr.course c WHERE c.id = :courseId AND cr.resourceType = :resourceType")
    List<CourseResource> findByCourseIdAndResourceType(Long courseId, String resourceType);
    
    void deleteByCourseId(Long courseId);
    
    void deleteByResourceId(Long resourceId);
} 