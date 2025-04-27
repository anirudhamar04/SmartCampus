package com.smartcampus.service;

import com.smartcampus.dto.EventDTO;
import java.time.LocalDateTime;
import java.util.List;

public interface EventService {
    EventDTO createEvent(EventDTO eventDTO);
    EventDTO updateEvent(Long id, EventDTO eventDTO);
    EventDTO getEventById(Long id);
    List<EventDTO> getAllEvents();
    List<EventDTO> getUpcomingEvents();
    EventDTO registerForEvent(Long eventId, Long userId);
    EventDTO unregisterFromEvent(Long eventId, Long userId);
    List<EventDTO> getEventsByOrganizer(Long organizerId);
    List<EventDTO> getEventsByDateRange(LocalDateTime start, LocalDateTime end);
    void deleteEvent(Long id);
} 