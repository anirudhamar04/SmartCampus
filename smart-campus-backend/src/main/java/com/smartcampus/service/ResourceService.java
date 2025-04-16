package com.smartcampus.service;

import com.smartcampus.dto.ResourceDTO;
import com.smartcampus.model.Resource;
import com.smartcampus.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    @Transactional
    public ResourceDTO createResource(ResourceDTO resourceDTO) {
        Resource resource = new Resource();
        resource.setName(resourceDTO.getName());
        resource.setDescription(resourceDTO.getDescription());
        resource.setType(resourceDTO.getType());
        resource.setLocation(resourceDTO.getLocation());
        resource.setCapacity(resourceDTO.getCapacity());
        resource.setAvailable(resourceDTO.isAvailable());
        resource.setOpeningTime(resourceDTO.getOpeningTime());
        resource.setClosingTime(resourceDTO.getClosingTime());
        resource.setImageUrl(resourceDTO.getImageUrl());
        resource.setSpecifications(resourceDTO.getSpecifications());
        resource.setStatus(resourceDTO.getStatus());
        resource.setBookingRules(resourceDTO.getBookingRules());
        resource.setRestrictions(resourceDTO.getRestrictions());

        Resource savedResource = resourceRepository.save(resource);
        return convertToDTO(savedResource);
    }

    @Transactional
    public ResourceDTO updateResource(Long id, ResourceDTO resourceDTO) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        resource.setName(resourceDTO.getName());
        resource.setDescription(resourceDTO.getDescription());
        resource.setType(resourceDTO.getType());
        resource.setLocation(resourceDTO.getLocation());
        resource.setCapacity(resourceDTO.getCapacity());
        resource.setAvailable(resourceDTO.isAvailable());
        resource.setOpeningTime(resourceDTO.getOpeningTime());
        resource.setClosingTime(resourceDTO.getClosingTime());
        resource.setImageUrl(resourceDTO.getImageUrl());
        resource.setSpecifications(resourceDTO.getSpecifications());
        resource.setStatus(resourceDTO.getStatus());
        resource.setBookingRules(resourceDTO.getBookingRules());
        resource.setRestrictions(resourceDTO.getRestrictions());

        Resource updatedResource = resourceRepository.save(resource);
        return convertToDTO(updatedResource);
    }

    public ResourceDTO getResourceById(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
        return convertToDTO(resource);
    }

    public List<ResourceDTO> getAllResources() {
        return resourceRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ResourceDTO> getResourcesByType(String type) {
        return resourceRepository.findByType(type).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ResourceDTO> getAvailableResources() {
        return resourceRepository.findByAvailable(true).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ResourceDTO updateAvailability(Long id, boolean available) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
        resource.setAvailable(available);
        Resource updatedResource = resourceRepository.save(resource);
        return convertToDTO(updatedResource);
    }

    private ResourceDTO convertToDTO(Resource resource) {
        ResourceDTO dto = new ResourceDTO();
        dto.setId(resource.getId());
        dto.setName(resource.getName());
        dto.setDescription(resource.getDescription());
        dto.setType(resource.getType());
        dto.setLocation(resource.getLocation());
        dto.setCapacity(resource.getCapacity());
        dto.setAvailable(resource.isAvailable());
        dto.setOpeningTime(resource.getOpeningTime());
        dto.setClosingTime(resource.getClosingTime());
        dto.setImageUrl(resource.getImageUrl());
        dto.setSpecifications(resource.getSpecifications());
        dto.setStatus(resource.getStatus());
        dto.setBookingRules(resource.getBookingRules());
        dto.setRestrictions(resource.getRestrictions());
        return dto;
    }
} 