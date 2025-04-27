package com.smartcampus.service;

import com.smartcampus.dto.FacilityDTO;
import com.smartcampus.model.Facility;
import com.smartcampus.repository.FacilityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FacilityService {

    private final FacilityRepository facilityRepository;

    public FacilityService(FacilityRepository facilityRepository) {
        this.facilityRepository = facilityRepository;
    }

    public List<FacilityDTO> getAllFacilities() {
        return facilityRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public FacilityDTO getFacilityById(Long id) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facility not found"));
        return convertToDTO(facility);
    }

    @Transactional
    public FacilityDTO createFacility(FacilityDTO facilityDTO) {
        Facility facility = convertToEntity(facilityDTO);
        Facility savedFacility = facilityRepository.save(facility);
        return convertToDTO(savedFacility);
    }

    @Transactional
    public FacilityDTO updateFacility(Long id, FacilityDTO facilityDTO) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facility not found"));
        facility.setName(facilityDTO.getName());
        facility.setDescription(facilityDTO.getDescription());
        facility.setLocation(facilityDTO.getLocation());
        facility.setType(facilityDTO.getType());
        facility.setCapacity(facilityDTO.getCapacity());
        facility.setAvailable(facilityDTO.isAvailable());
        facility.setOpeningTime(facilityDTO.getOpeningTime());
        facility.setClosingTime(facilityDTO.getClosingTime());
        facility.setImageUrl(facilityDTO.getImageUrl());
        facility.setAmenities(facilityDTO.getAmenities());
        facility.setStatus(facilityDTO.getStatus());
        Facility updatedFacility = facilityRepository.save(facility);
        return convertToDTO(updatedFacility);
    }

    @Transactional
    public void deleteFacility(Long id) {
        Facility facility = facilityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facility not found"));
        facilityRepository.delete(facility);
    }

    private FacilityDTO convertToDTO(Facility facility) {
        FacilityDTO dto = new FacilityDTO();
        dto.setId(facility.getId());
        dto.setName(facility.getName());
        dto.setDescription(facility.getDescription());
        dto.setLocation(facility.getLocation());
        dto.setType(facility.getType());
        dto.setCapacity(facility.getCapacity());
        dto.setAvailable(facility.isAvailable());
        dto.setOpeningTime(facility.getOpeningTime());
        dto.setClosingTime(facility.getClosingTime());
        dto.setImageUrl(facility.getImageUrl());
        dto.setAmenities(facility.getAmenities());
        dto.setStatus(facility.getStatus());
        return dto;
    }

    private Facility convertToEntity(FacilityDTO dto) {
        Facility facility = new Facility();
        facility.setName(dto.getName());
        facility.setDescription(dto.getDescription());
        facility.setLocation(dto.getLocation());
        facility.setType(dto.getType());
        facility.setCapacity(dto.getCapacity());
        facility.setAvailable(dto.isAvailable());
        facility.setOpeningTime(dto.getOpeningTime());
        facility.setClosingTime(dto.getClosingTime());
        facility.setImageUrl(dto.getImageUrl());
        facility.setAmenities(dto.getAmenities());
        facility.setStatus(dto.getStatus());
        return facility;
    }
}