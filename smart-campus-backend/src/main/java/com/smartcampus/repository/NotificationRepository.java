package com.smartcampus.repository;

import com.smartcampus.model.Notification;
import com.smartcampus.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);
    List<Notification> findByRecipientAndReadFalseOrderByCreatedAtDesc(User recipient);
    List<Notification> findByRecipientAndType(User recipient, String type);
    List<Notification> findByRecipientAndReadFalse(User recipient);
    List<Notification> findByType(String type);
    List<Notification> findByPriority(String priority);
    List<Notification> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    List<Notification> findByRecipientAndCreatedAtAfter(User recipient, LocalDateTime date);
} 