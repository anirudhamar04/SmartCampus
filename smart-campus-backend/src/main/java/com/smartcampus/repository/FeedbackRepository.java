package com.smartcampus.repository;

import com.smartcampus.model.Feedback;
import com.smartcampus.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByUser(User user);
    List<Feedback> findByStatus(String status);
    List<Feedback> findByCategory(String category);
    List<Feedback> findByPriority(String priority);
    List<Feedback> findBySubmissionTimeBetween(LocalDateTime start, LocalDateTime end);
    List<Feedback> findByRespondedBy(User respondedBy);
} 