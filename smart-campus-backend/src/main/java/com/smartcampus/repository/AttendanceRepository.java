package com.smartcampus.repository;

import com.smartcampus.model.Attendance;
import com.smartcampus.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByUserAndCheckInTimeBetween(User user, LocalDateTime start, LocalDateTime end);
    List<Attendance> findByUser(User user);
    List<Attendance> findByStatus(String status);
    List<Attendance> findByLocation(String location);
    List<Attendance> findByUser_Id(Long userId);
    List<Attendance> findByCheckInTimeBetween(LocalDateTime startTime, LocalDateTime endTime);
} 