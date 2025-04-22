package com.smartcampus.controller;

import com.smartcampus.dto.NotificationDTO;
import com.smartcampus.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    
    @Autowired
    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getAllNotifications() {
        // This would typically have some admin role check
        return ResponseEntity.ok(notificationService.getAllNotifications());
    }

    @PostMapping
    public ResponseEntity<NotificationDTO> createNotification(@RequestBody NotificationDTO notificationDTO) {
        return ResponseEntity.ok(notificationService.createNotification(notificationDTO));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<List<NotificationDTO>> markAllAsRead(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.markAllAsRead(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotificationDTO> getNotificationById(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.getNotificationById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationDTO>> getNotificationsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getNotificationsByUser(userId));
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
    }

    @GetMapping("/user/{userId}/type/{type}")
    public ResponseEntity<List<NotificationDTO>> getNotificationsByType(
            @PathVariable Long userId,
            @PathVariable String type) {
        return ResponseEntity.ok(notificationService.getNotificationsByType(userId, type));
    }
    
    @GetMapping("/sent/{userId}")
    public ResponseEntity<List<NotificationDTO>> getNotificationsSentByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getNotificationsSentByUser(userId));
    }
    
    @GetMapping("/user/{userId}/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadNotificationsCount(@PathVariable Long userId) {
        Map<String, Long> response = new HashMap<>();
        response.put("count", notificationService.getUnreadNotificationsCount(userId));
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/broadcast/role")
    public ResponseEntity<List<NotificationDTO>> broadcastNotificationByRole(
            @RequestParam String role,
            @RequestBody NotificationDTO notificationDTO) {
        return ResponseEntity.ok(notificationService.broadcastNotificationByRole(role, notificationDTO));
    }
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getNotificationStats() {
        // This would typically have some admin role check
        return ResponseEntity.ok(notificationService.getNotificationStats());
    }
} 