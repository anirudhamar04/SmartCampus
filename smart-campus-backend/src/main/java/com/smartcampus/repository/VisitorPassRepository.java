package com.smartcampus.repository;

import com.smartcampus.model.User;
import com.smartcampus.model.VisitorPass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VisitorPassRepository extends JpaRepository<VisitorPass, Long> {
    List<VisitorPass> findByHost(User host);
    List<VisitorPass> findByStatus(String status);
    List<VisitorPass> findByEntryTimeBetween(LocalDateTime start, LocalDateTime end);
    List<VisitorPass> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    List<VisitorPass> findByApprovedBy(User approvedBy);
    List<VisitorPass> findByVisitorEmail(String email);
    List<VisitorPass> findByVisitorPhone(String phone);
} 