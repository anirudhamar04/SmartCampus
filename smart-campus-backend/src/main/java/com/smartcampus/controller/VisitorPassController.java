package com.smartcampus.controller;

import com.smartcampus.dto.VisitorPassDTO;
import com.smartcampus.service.VisitorPassService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/visitor-passes")
@RequiredArgsConstructor
public class VisitorPassController {

    private final VisitorPassService visitorPassService;

    @PostMapping
    public ResponseEntity<VisitorPassDTO> createVisitorPass(@RequestBody VisitorPassDTO passDTO) {
        return ResponseEntity.ok(visitorPassService.createVisitorPass(passDTO));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<VisitorPassDTO> approveVisitorPass(
            @PathVariable Long id,
            @RequestParam Long approverId) {
        return ResponseEntity.ok(visitorPassService.approveVisitorPass(id, approverId));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<VisitorPassDTO> rejectVisitorPass(
            @PathVariable Long id,
            @RequestParam Long approverId,
            @RequestParam String remarks) {
        return ResponseEntity.ok(visitorPassService.rejectVisitorPass(id, approverId, remarks));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VisitorPassDTO> updateVisitorPass(
            @PathVariable Long id,
            @RequestBody VisitorPassDTO passDTO) {
        return ResponseEntity.ok(visitorPassService.updateVisitorPass(id, passDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VisitorPassDTO> getVisitorPassById(@PathVariable Long id) {
        return ResponseEntity.ok(visitorPassService.getVisitorPassById(id));
    }

    @GetMapping("/host/{hostId}")
    public ResponseEntity<List<VisitorPassDTO>> getVisitorPassesByHost(@PathVariable Long hostId) {
        return ResponseEntity.ok(visitorPassService.getVisitorPassesByHost(hostId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<VisitorPassDTO>> getVisitorPassesByStatus(@PathVariable String status) {
        return ResponseEntity.ok(visitorPassService.getVisitorPassesByStatus(status));
    }
} 