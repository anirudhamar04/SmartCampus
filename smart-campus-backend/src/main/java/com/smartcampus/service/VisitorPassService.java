package com.smartcampus.service;

import com.smartcampus.dto.VisitorPassDTO;
import java.time.LocalDateTime;
import java.util.List;

public interface VisitorPassService {
    VisitorPassDTO createVisitorPass(VisitorPassDTO visitorPassDTO);
    VisitorPassDTO updateVisitorPass(Long id, VisitorPassDTO visitorPassDTO);
    VisitorPassDTO getVisitorPassById(Long id);
    List<VisitorPassDTO> getVisitorPassesByHost(Long hostId);
    List<VisitorPassDTO> getVisitorPassesByStatus(String status);
    List<VisitorPassDTO> getVisitorPassesByDateRange(LocalDateTime start, LocalDateTime end);
    VisitorPassDTO approveVisitorPass(Long id, Long approvedById);
    VisitorPassDTO rejectVisitorPass(Long id, Long approvedById, String rejectionReason);
    VisitorPassDTO checkInVisitor(Long id);
    VisitorPassDTO checkOutVisitor(Long id);
    void deleteVisitorPass(Long id);
} 