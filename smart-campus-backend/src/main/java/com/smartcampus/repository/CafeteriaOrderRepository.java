package com.smartcampus.repository;

import com.smartcampus.model.CafeteriaOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CafeteriaOrderRepository extends JpaRepository<CafeteriaOrder, Long> {
    List<CafeteriaOrder> findByUserId(Long userId);
    List<CafeteriaOrder> findByStatus(String status);
} 