package com.smartcampus.controller;

import com.smartcampus.dto.VisitorPassDTO;
import com.smartcampus.service.VisitorPassService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/visitor-passes")
public class VisitorPassController {

    private final VisitorPassService visitorPassService;

    @Autowired
    public VisitorPassController(VisitorPassService visitorPassService) {
        this.visitorPassService = visitorPassService;
    }

    @PostMapping
    public ResponseEntity<VisitorPassDTO> createVisitorPass(@RequestBody VisitorPassDTO visitorPassDTO) {
        VisitorPassDTO createdPass = visitorPassService.createVisitorPass(visitorPassDTO);
        return ResponseEntity.ok(createdPass);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VisitorPassDTO> updateVisitorPass(
            @PathVariable Long id,
            @RequestBody VisitorPassDTO visitorPassDTO) {
        VisitorPassDTO updatedPass = visitorPassService.updateVisitorPass(id, visitorPassDTO);
        return ResponseEntity.ok(updatedPass);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VisitorPassDTO> getVisitorPassById(@PathVariable Long id) {
        VisitorPassDTO pass = visitorPassService.getVisitorPassById(id);
        return ResponseEntity.ok(pass);
    }

    @GetMapping("/host/{hostId}")
    public ResponseEntity<List<VisitorPassDTO>> getVisitorPassesByHost(@PathVariable Long hostId) {
        List<VisitorPassDTO> passes = visitorPassService.getVisitorPassesByHost(hostId);
        return ResponseEntity.ok(passes);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<VisitorPassDTO>> getVisitorPassesByStatus(@PathVariable String status) {
        List<VisitorPassDTO> passes = visitorPassService.getVisitorPassesByStatus(status);
        return ResponseEntity.ok(passes);
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<VisitorPassDTO> approveVisitorPass(
            @PathVariable Long id,
            @RequestParam Long approvedById) {
        VisitorPassDTO approvedPass = visitorPassService.approveVisitorPass(id, approvedById);
        return ResponseEntity.ok(approvedPass);
    }

    @PutMapping("/{id}/check-out")
    public ResponseEntity<VisitorPassDTO> checkOutVisitor(@PathVariable Long id) {
        VisitorPassDTO updatedPass = visitorPassService.checkOutVisitor(id);
        return ResponseEntity.ok(updatedPass);
    }
} 