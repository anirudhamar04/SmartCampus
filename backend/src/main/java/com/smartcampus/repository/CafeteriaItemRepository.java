package com.smartcampus.repository;

import com.smartcampus.model.CafeteriaItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CafeteriaItemRepository extends JpaRepository<CafeteriaItem, Long> {
    List<CafeteriaItem> findByAvailableTrue();
    List<CafeteriaItem> findByCategory(String category);
    List<CafeteriaItem> findByAvailable(boolean available);
    List<CafeteriaItem> findByNameContainingIgnoreCase(String name);
    List<CafeteriaItem> findByCategoryAndAvailable(String category, boolean available);
} 