package com.smartcampus.service;

import com.smartcampus.dto.LostFoundItemDTO;
import com.smartcampus.model.LostFoundItem;
import com.smartcampus.model.User;
import com.smartcampus.repository.LostFoundItemRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LostFoundService {

    private final LostFoundItemRepository lostFoundItemRepository;
    private final UserRepository userRepository;

    @Transactional
    public LostFoundItemDTO reportLostItem(LostFoundItemDTO itemDTO) {
        User foundBy = userRepository.findById(itemDTO.getFoundById())
                .orElseThrow(() -> new RuntimeException("User not found"));

        LostFoundItem item = new LostFoundItem();
        item.setItemName(itemDTO.getItemName());
        item.setDescription(itemDTO.getDescription());
        item.setLocationFound(itemDTO.getLocationFound());
        item.setDateFound(LocalDateTime.now());
        item.setFoundBy(foundBy);
        item.setStatus("LOST");
        item.setCategory(itemDTO.getCategory());
        item.setImageUrl(itemDTO.getImageUrl());

        LostFoundItem savedItem = lostFoundItemRepository.save(item);
        return convertToDTO(savedItem);
    }

    @Transactional
    public LostFoundItemDTO claimItem(Long id, Long userId) {
        LostFoundItem item = lostFoundItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        User claimedBy = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        item.setClaimedBy(claimedBy);
        item.setClaimDate(LocalDateTime.now());
        item.setStatus("CLAIMED");

        LostFoundItem updatedItem = lostFoundItemRepository.save(item);
        return convertToDTO(updatedItem);
    }

    @Transactional
    public LostFoundItemDTO updateItem(Long id, LostFoundItemDTO itemDTO) {
        LostFoundItem item = lostFoundItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        item.setItemName(itemDTO.getItemName());
        item.setDescription(itemDTO.getDescription());
        item.setLocationFound(itemDTO.getLocationFound());
        item.setCategory(itemDTO.getCategory());
        item.setImageUrl(itemDTO.getImageUrl());
        item.setVerificationDetails(itemDTO.getVerificationDetails());

        LostFoundItem updatedItem = lostFoundItemRepository.save(item);
        return convertToDTO(updatedItem);
    }

    public LostFoundItemDTO getItemById(Long id) {
        LostFoundItem item = lostFoundItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        return convertToDTO(item);
    }

    public List<LostFoundItemDTO> getItemsByStatus(String status) {
        return lostFoundItemRepository.findByStatus(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<LostFoundItemDTO> getItemsByCategory(String category) {
        return lostFoundItemRepository.findByCategory(category).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<LostFoundItemDTO> getItemsByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return lostFoundItemRepository.findByFoundBy(user).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private LostFoundItemDTO convertToDTO(LostFoundItem item) {
        LostFoundItemDTO dto = new LostFoundItemDTO();
        dto.setId(item.getId());
        dto.setItemName(item.getItemName());
        dto.setDescription(item.getDescription());
        dto.setLocationFound(item.getLocationFound());
        dto.setDateFound(item.getDateFound());
        dto.setFoundById(item.getFoundBy().getId());
        dto.setFoundByName(item.getFoundBy().getFullName());
        if (item.getClaimedBy() != null) {
            dto.setClaimedById(item.getClaimedBy().getId());
            dto.setClaimedByName(item.getClaimedBy().getFullName());
        }
        dto.setStatus(item.getStatus());
        dto.setCategory(item.getCategory());
        dto.setImageUrl(item.getImageUrl());
        dto.setClaimDate(item.getClaimDate());
        dto.setVerificationDetails(item.getVerificationDetails());
        return dto;
    }
} 