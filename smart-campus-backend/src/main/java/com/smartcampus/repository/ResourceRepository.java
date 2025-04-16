package com.smartcampus.repository;

import com.smartcampus.model.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByType(String type);
    List<Resource> findByAvailable(boolean available);
    List<Resource> findByStatus(String status);
    List<Resource> findByLocation(String location);
    List<Resource> findByTypeAndAvailable(String type, boolean available);
    List<Resource> findByNameContainingIgnoreCase(String name);
} 