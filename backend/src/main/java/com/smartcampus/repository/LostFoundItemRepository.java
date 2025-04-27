package com.smartcampus.repository;

import com.smartcampus.model.LostFoundItem;
import com.smartcampus.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LostFoundItemRepository extends JpaRepository<LostFoundItem, Long> {
    List<LostFoundItem> findByStatus(String status);
    List<LostFoundItem> findByCategory(String category);
    List<LostFoundItem> findByFoundBy(User foundBy);
    List<LostFoundItem> findByClaimedBy(User claimedBy);
    List<LostFoundItem> findByDateFoundBetween(LocalDateTime start, LocalDateTime end);
    List<LostFoundItem> findByLocationFound(String location);
} 