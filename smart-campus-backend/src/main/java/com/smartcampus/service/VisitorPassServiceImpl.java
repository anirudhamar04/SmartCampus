package com.smartcampus.service;

import com.smartcampus.dto.VisitorPassDTO;
import com.smartcampus.model.VisitorPass;
import com.smartcampus.model.User;
import com.smartcampus.repository.VisitorPassRepository;
import com.smartcampus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VisitorPassServiceImpl implements VisitorPassService {

    private final VisitorPassRepository visitorPassRepository;
    private final UserRepository userRepository;

    @Autowired
    public VisitorPassServiceImpl(VisitorPassRepository visitorPassRepository, UserRepository userRepository) {
        this.visitorPassRepository = visitorPassRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public VisitorPassDTO createVisitorPass(VisitorPassDTO visitorPassDTO) {
        User host = userRepository.findById(visitorPassDTO.getHostId())
            .orElseThrow(() -> new RuntimeException("Host not found"));

        VisitorPass pass = new VisitorPass();
        pass.setVisitorName(visitorPassDTO.getVisitorName());
        pass.setVisitorEmail(visitorPassDTO.getVisitorEmail());
        pass.setVisitorPhone(visitorPassDTO.getVisitorPhone());
        pass.setPurpose(visitorPassDTO.getPurpose());
        pass.setHost(host);
        pass.setEntryTime(visitorPassDTO.getEntryTime());
        pass.setExitTime(visitorPassDTO.getExitTime());
        pass.setStatus("PENDING");
        pass.setQrCode(visitorPassDTO.getQrCode());
        pass.setIdProofType(visitorPassDTO.getIdProofType());
        pass.setIdProofNumber(visitorPassDTO.getIdProofNumber());
        pass.setVehicleNumber(visitorPassDTO.getVehicleNumber());
        pass.setRemarks(visitorPassDTO.getRemarks());
        pass.setCreatedAt(LocalDateTime.now());

        VisitorPass savedPass = visitorPassRepository.save(pass);
        return convertToDTO(savedPass);
    }

    @Override
    @Transactional
    public VisitorPassDTO updateVisitorPass(Long id, VisitorPassDTO visitorPassDTO) {
        VisitorPass pass = visitorPassRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Visitor pass not found"));

        pass.setVisitorName(visitorPassDTO.getVisitorName());
        pass.setVisitorEmail(visitorPassDTO.getVisitorEmail());
        pass.setVisitorPhone(visitorPassDTO.getVisitorPhone());
        pass.setPurpose(visitorPassDTO.getPurpose());
        pass.setEntryTime(visitorPassDTO.getEntryTime());
        pass.setExitTime(visitorPassDTO.getExitTime());
        pass.setStatus(visitorPassDTO.getStatus());
        pass.setQrCode(visitorPassDTO.getQrCode());
        pass.setIdProofType(visitorPassDTO.getIdProofType());
        pass.setIdProofNumber(visitorPassDTO.getIdProofNumber());
        pass.setVehicleNumber(visitorPassDTO.getVehicleNumber());
        pass.setRemarks(visitorPassDTO.getRemarks());

        VisitorPass updatedPass = visitorPassRepository.save(pass);
        return convertToDTO(updatedPass);
    }

    @Override
    public VisitorPassDTO getVisitorPassById(Long id) {
        VisitorPass pass = visitorPassRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Visitor pass not found"));
        return convertToDTO(pass);
    }

    @Override
    public List<VisitorPassDTO> getVisitorPassesByHost(Long hostId) {
        User host = userRepository.findById(hostId)
            .orElseThrow(() -> new RuntimeException("Host not found"));
        
        return visitorPassRepository.findByHost(host).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public List<VisitorPassDTO> getVisitorPassesByStatus(String status) {
        return visitorPassRepository.findByStatus(status).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public VisitorPassDTO approveVisitorPass(Long id, Long approvedById) {
        VisitorPass pass = visitorPassRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Visitor pass not found"));
        
        User approver = userRepository.findById(approvedById)
            .orElseThrow(() -> new RuntimeException("Approver not found"));

        pass.setStatus("APPROVED");
        pass.setApprovedBy(approver);
        pass.setApprovedAt(LocalDateTime.now());

        VisitorPass updatedPass = visitorPassRepository.save(pass);
        return convertToDTO(updatedPass);
    }

    @Override
    @Transactional
    public VisitorPassDTO checkOutVisitor(Long id) {
        VisitorPass pass = visitorPassRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Visitor pass not found"));

        pass.setStatus("CHECKED_OUT");
        pass.setExitTime(LocalDateTime.now());

        VisitorPass updatedPass = visitorPassRepository.save(pass);
        return convertToDTO(updatedPass);
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