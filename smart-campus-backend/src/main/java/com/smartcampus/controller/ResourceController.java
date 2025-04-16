package com.smartcampus.controller;

import com.smartcampus.dto.ResourceDTO;
import com.smartcampus.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    @PostMapping
    public ResponseEntity<ResourceDTO> createResource(@RequestBody ResourceDTO resourceDTO) {
        return ResponseEntity.ok(resourceService.createResource(resourceDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResourceDTO> updateResource(
            @PathVariable Long id,
            @RequestBody ResourceDTO resourceDTO) {
        return ResponseEntity.ok(resourceService.updateResource(id, resourceDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceDTO> getResourceById(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    @GetMapping
    public ResponseEntity<List<ResourceDTO>> getAllResources() {
        return ResponseEntity.ok(resourceService.getAllResources());
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<ResourceDTO>> getResourcesByType(@PathVariable String type) {
        return ResponseEntity.ok(resourceService.getResourcesByType(type));
    }

    @GetMapping("/available")
    public ResponseEntity<List<ResourceDTO>> getAvailableResources() {
        return ResponseEntity.ok(resourceService.getAvailableResources());
    }

    @PutMapping("/{id}/availability")
    public ResponseEntity<ResourceDTO> updateAvailability(
            @PathVariable Long id,
            @RequestParam boolean available) {
        return ResponseEntity.ok(resourceService.updateAvailability(id, available));
    }
} 