package com.smartcampus.controller;

import com.smartcampus.dto.FacilityDTO;
import com.smartcampus.service.FacilityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}, allowedHeaders = "*", allowCredentials = "true")
@RequestMapping("/api/facilities")
public class FacilityController {

    private final FacilityService facilityService;

    public FacilityController(FacilityService facilityService) {
        this.facilityService = facilityService;
    }

    @GetMapping
    public ResponseEntity<List<FacilityDTO>> getAllFacilities() {
        return ResponseEntity.ok(facilityService.getAllFacilities());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FacilityDTO> getFacilityById(@PathVariable Long id) {
        return ResponseEntity.ok(facilityService.getFacilityById(id));
    }

    @PostMapping
    public ResponseEntity<FacilityDTO> createFacility(@RequestBody FacilityDTO facilityDTO) {
        return ResponseEntity.ok(facilityService.createFacility(facilityDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FacilityDTO> updateFacility(@PathVariable Long id, @RequestBody FacilityDTO facilityDTO) {
        return ResponseEntity.ok(facilityService.updateFacility(id, facilityDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFacility(@PathVariable Long id) {
        facilityService.deleteFacility(id);
        return ResponseEntity.noContent().build();
    }
}