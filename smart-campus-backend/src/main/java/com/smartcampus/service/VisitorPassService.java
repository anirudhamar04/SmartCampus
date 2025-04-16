package com.smartcampus.service;

import com.smartcampus.dto.VisitorPassDTO;
import com.smartcampus.model.VisitorPass;
import com.smartcampus.model.User;
import com.smartcampus.repository.VisitorPassRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VisitorPassService {

    private final VisitorPassRepository visitorPassRepository;
    private final UserRepository userRepository;

    @Transactional
    public VisitorPassDTO createVisitorPass(VisitorPassDTO passDTO) {
        User host = userRepository.findById(passDTO.getHostId())
                .orElseThrow(() -> new RuntimeException("Host not found"));

        VisitorPass pass = new VisitorPass();
        pass.setVisitorName(passDTO.getVisitorName());
        pass.setVisitorEmail(passDTO.getVisitorEmail());
        pass.setVisitorPhone(passDTO.getVisitorPhone());
        pass.setPurpose(passDTO.getPurpose());
        pass.setHost(host);
        pass.setEntryTime(passDTO.getEntryTime());
        pass.setExitTime(passDTO.getExitTime());
        pass.setStatus("PENDING");
        pass.setQrCode(generateQRCode());
        pass.setIdProofType(passDTO.getIdProofType());
        pass.setIdProofNumber(passDTO.getIdProofNumber());
        pass.setVehicleNumber(passDTO.getVehicleNumber());
        pass.setRemarks(passDTO.getRemarks());
        pass.setCreatedAt(LocalDateTime.now());

        VisitorPass savedPass = visitorPassRepository.save(pass);
        return convertToDTO(savedPass);
    }

    @Transactional
    public VisitorPassDTO approveVisitorPass(Long id, Long approverId) {
        VisitorPass pass = visitorPassRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Visitor pass not found"));
        User approver = userRepository.findById(approverId)
                .orElseThrow(() -> new RuntimeException("Approver not found"));

        pass.setStatus("APPROVED");
        pass.setApprovedAt(LocalDateTime.now());
        pass.setApprovedBy(approver);

        VisitorPass updatedPass = visitorPassRepository.save(pass);
        return convertToDTO(updatedPass);
    }

    @Transactional
    public VisitorPassDTO rejectVisitorPass(Long id, Long approverId, String remarks) {
        VisitorPass pass = visitorPassRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Visitor pass not found"));
        User approver = userRepository.findById(approverId)
                .orElseThrow(() -> new RuntimeException("Approver not found"));

        pass.setStatus("REJECTED");
        pass.setApprovedAt(LocalDateTime.now());
        pass.setApprovedBy(approver);
        pass.setRemarks(remarks);

        VisitorPass updatedPass = visitorPassRepository.save(pass);
        return convertToDTO(updatedPass);
    }

    @Transactional
    public VisitorPassDTO updateVisitorPass(Long id, VisitorPassDTO passDTO) {
        VisitorPass pass = visitorPassRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Visitor pass not found"));

        pass.setVisitorName(passDTO.getVisitorName());
        pass.setVisitorEmail(passDTO.getVisitorEmail());
        pass.setVisitorPhone(passDTO.getVisitorPhone());
        pass.setPurpose(passDTO.getPurpose());
        pass.setEntryTime(passDTO.getEntryTime());
        pass.setExitTime(passDTO.getExitTime());
        pass.setIdProofType(passDTO.getIdProofType());
        pass.setIdProofNumber(passDTO.getIdProofNumber());
        pass.setVehicleNumber(passDTO.getVehicleNumber());
        pass.setRemarks(passDTO.getRemarks());

        VisitorPass updatedPass = visitorPassRepository.save(pass);
        return convertToDTO(updatedPass);
    }

    public VisitorPassDTO getVisitorPassById(Long id) {
        VisitorPass pass = visitorPassRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Visitor pass not found"));
        return convertToDTO(pass);
    }

    public List<VisitorPassDTO> getVisitorPassesByHost(Long hostId) {
        User host = userRepository.findById(hostId)
                .orElseThrow(() -> new RuntimeException("Host not found"));
        return visitorPassRepository.findByHost(host).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<VisitorPassDTO> getVisitorPassesByStatus(String status) {
        return visitorPassRepository.findByStatus(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private String generateQRCode() {
        // Implement QR code generation logic
        return "QR-" + System.currentTimeMillis();
    }

    private VisitorPassDTO convertToDTO(VisitorPass pass) {
        VisitorPassDTO dto = new VisitorPassDTO();
        dto.setId(pass.getId());
        dto.setVisitorName(pass.getVisitorName());
        dto.setVisitorEmail(pass.getVisitorEmail());
        dto.setVisitorPhone(pass.getVisitorPhone());
        dto.setPurpose(pass.getPurpose());
        dto.setHostId(pass.getHost().getId());
        dto.setHostName(pass.getHost().getFullName());
        dto.setEntryTime(pass.getEntryTime());
        dto.setExitTime(pass.getExitTime());
        dto.setStatus(pass.getStatus());
        dto.setQrCode(pass.getQrCode());
        dto.setIdProofType(pass.getIdProofType());
        dto.setIdProofNumber(pass.getIdProofNumber());
        dto.setVehicleNumber(pass.getVehicleNumber());
        dto.setRemarks(pass.getRemarks());
        dto.setCreatedAt(pass.getCreatedAt());
        dto.setApprovedAt(pass.getApprovedAt());
        if (pass.getApprovedBy() != null) {
            dto.setApprovedById(pass.getApprovedBy().getId());
            dto.setApprovedByName(pass.getApprovedBy().getFullName());
        }
        return dto;
    }
} 