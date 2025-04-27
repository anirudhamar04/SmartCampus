package com.smartcampus.repository;

import com.smartcampus.model.Event;
import com.smartcampus.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByOrganizer(User organizer);
    List<Event> findByStatus(String status);
    List<Event> findByEventType(String eventType);
    List<Event> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);
    List<Event> findByParticipantsContaining(User participant);
    List<Event> findByLocation(String location);
    List<Event> findByStartTimeAfter(LocalDateTime start);
    List<Event> findAll();
} 