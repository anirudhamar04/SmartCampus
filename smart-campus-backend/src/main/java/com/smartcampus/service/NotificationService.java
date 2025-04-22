package com.smartcampus.service;

import com.smartcampus.dto.NotificationDTO;
import com.smartcampus.model.Notification;
import com.smartcampus.model.Role;
import com.smartcampus.model.User;
import com.smartcampus.repository.NotificationRepository;
import com.smartcampus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Autowired
    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public NotificationDTO createNotification(NotificationDTO notificationDTO) {
        User recipient = userRepository.findById(notificationDTO.getRecipientId())
                .orElseThrow(() -> new RuntimeException("Recipient not found"));
                
        User sender = null;
        if (notificationDTO.getSenderId() != null) {
            sender = userRepository.findById(notificationDTO.getSenderId())
                    .orElseThrow(() -> new RuntimeException("Sender not found"));
        }

        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setSender(sender);
        notification.setTitle(notificationDTO.getTitle());
        notification.setMessage(notificationDTO.getMessage());
        notification.setType(notificationDTO.getType());
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRead(false);
        notification.setPriority(notificationDTO.getPriority());
        notification.setActionUrl(notificationDTO.getActionUrl());
        notification.setStatus(notificationDTO.getStatus() != null ? notificationDTO.getStatus() : "ACTIVE");
        notification.setIcon(notificationDTO.getIcon());
        notification.setCategory(notificationDTO.getCategory());
        notification.setSource(notificationDTO.getSource());
        notification.setExpiryDate(notificationDTO.getExpiryDate());
        notification.setMetadata(notificationDTO.getMetadata());

        Notification savedNotification = notificationRepository.save(notification);
        return convertToDTO(savedNotification);
    }

    @Transactional
    public NotificationDTO markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        notification.setRead(true);
        notification.setReadAt(LocalDateTime.now());

        Notification updatedNotification = notificationRepository.save(notification);
        return convertToDTO(updatedNotification);
    }

    @Transactional
    public List<NotificationDTO> markAllAsRead(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Notification> notifications = notificationRepository.findByRecipientAndReadFalse(user);
        notifications.forEach(notification -> {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
        });

        List<Notification> updatedNotifications = notificationRepository.saveAll(notifications);
        return updatedNotifications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public NotificationDTO getNotificationById(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        return convertToDTO(notification);
    }

    public List<NotificationDTO> getNotificationsByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return notificationRepository.findByRecipientOrderByCreatedAtDesc(user).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<NotificationDTO> getUnreadNotifications(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return notificationRepository.findByRecipientAndReadFalseOrderByCreatedAtDesc(user).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<NotificationDTO> getNotificationsByType(Long userId, String type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.findByRecipientAndType(user, type).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<NotificationDTO> getNotificationsSentByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        return notificationRepository.findBySenderOrderByCreatedAtDesc(user).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public long getUnreadNotificationsCount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        return notificationRepository.countByRecipientAndReadFalse(user);
    }
    
    @Transactional
    public void deleteNotification(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
                
        notificationRepository.delete(notification);
    }
    
    @Transactional
    public List<NotificationDTO> broadcastNotificationByRole(String role, NotificationDTO notificationDTO) {
        List<User> users = userRepository.findByRole(Role.valueOf(role));
        
        List<Notification> notifications = users.stream().map(user -> {
            User sender = null;
            if (notificationDTO.getSenderId() != null) {
                sender = userRepository.findById(notificationDTO.getSenderId()).orElse(null);
            }
            
            Notification notification = new Notification();
            notification.setRecipient(user);
            notification.setSender(sender);
            notification.setTitle(notificationDTO.getTitle());
            notification.setMessage(notificationDTO.getMessage());
            notification.setType(notificationDTO.getType());
            notification.setCreatedAt(LocalDateTime.now());
            notification.setRead(false);
            notification.setPriority(notificationDTO.getPriority());
            notification.setActionUrl(notificationDTO.getActionUrl());
            notification.setStatus(notificationDTO.getStatus() != null ? notificationDTO.getStatus() : "ACTIVE");
            notification.setIcon(notificationDTO.getIcon());
            notification.setCategory(notificationDTO.getCategory());
            notification.setSource(notificationDTO.getSource());
            notification.setExpiryDate(notificationDTO.getExpiryDate());
            notification.setMetadata(notificationDTO.getMetadata());
            
            return notification;
        }).collect(Collectors.toList());
        
        List<Notification> savedNotifications = notificationRepository.saveAll(notifications);
        return savedNotifications.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<NotificationDTO> getAllNotifications() {
        return notificationRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getNotificationStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCount", notificationRepository.count());
        stats.put("unreadCount", notificationRepository.countByReadFalse());
        
        // Add more detailed stats
        stats.put("byType", notificationRepository.findAll().stream()
                .collect(Collectors.groupingBy(Notification::getType, Collectors.counting())));
        stats.put("byPriority", notificationRepository.findAll().stream()
                .collect(Collectors.groupingBy(Notification::getPriority, Collectors.counting())));
        
        return stats;
    }

    private NotificationDTO convertToDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setRecipientId(notification.getRecipient().getId());
        dto.setRecipientName(notification.getRecipient().getFullName());
        
        if (notification.getSender() != null) {
            dto.setSenderId(notification.getSender().getId());
            dto.setSenderName(notification.getSender().getFullName());
        }
        
        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        dto.setType(notification.getType());
        dto.setCreatedAt(notification.getCreatedAt());
        dto.setRead(notification.isRead());
        dto.setReadAt(notification.getReadAt());
        dto.setPriority(notification.getPriority());
        dto.setActionUrl(notification.getActionUrl());
        dto.setStatus(notification.getStatus());
        dto.setIcon(notification.getIcon());
        dto.setCategory(notification.getCategory());
        dto.setSource(notification.getSource());
        dto.setExpiryDate(notification.getExpiryDate());
        dto.setMetadata(notification.getMetadata());
        return dto;
    }
} 