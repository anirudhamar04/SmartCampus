package com.smartcampus.repository;

import com.smartcampus.model.Facility;
import com.smartcampus.model.FacilityBooking;
import com.smartcampus.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface FacilityBookingRepository extends JpaRepository<FacilityBooking, Long> {
    
    List<FacilityBooking> findByTeacher(User teacher);
    
    List<FacilityBooking> findByFacility(Facility facility);
    
    List<FacilityBooking> findByDate(LocalDate date);
    
    List<FacilityBooking> findByDateBetween(LocalDate startDate, LocalDate endDate);
    
    List<FacilityBooking> findByStatus(String status);
    
    @Query("SELECT b FROM FacilityBooking b WHERE b.facility = :facility AND b.date = :date " +
           "AND ((b.startTime <= :endTime AND b.endTime >= :startTime))")
    List<FacilityBooking> findConflictingBookings(
            @Param("facility") Facility facility,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime);
    
    @Query("SELECT b FROM FacilityBooking b WHERE b.facility = :facility AND b.date = :date " +
           "AND ((b.startTime <= :endTime AND b.endTime >= :startTime)) " +
           "AND b.id != :excludeId")
    List<FacilityBooking> findConflictingBookings(
            @Param("facility") Facility facility,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludeId") Long excludeId);
} 