package com.smartcampus.controller;

import com.smartcampus.dto.EventDTO;
import com.smartcampus.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    @Autowired
    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping
    public ResponseEntity<EventDTO> createEvent(@RequestBody EventDTO eventDTO) {
        EventDTO createdEvent = eventService.createEvent(eventDTO);
        return ResponseEntity.ok(createdEvent);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventDTO> updateEvent(
            @PathVariable Long id,
            @RequestBody EventDTO eventDTO) {
        // Debug logging
        System.out.println("Received event update request for ID: " + id);
        System.out.println("Event DTO: " + eventDTO);
        System.out.println("Event title: " + eventDTO.getTitle());
        System.out.println("Event startTime: " + eventDTO.getStartTime());
        System.out.println("Event startDate: " + eventDTO.getStartDate());
        System.out.println("Event endTime: " + eventDTO.getEndTime());
        System.out.println("Event endDate: " + eventDTO.getEndDate());
        
        EventDTO updatedEvent = eventService.updateEvent(id, eventDTO);
        return ResponseEntity.ok(updatedEvent);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventDTO> getEventById(@PathVariable Long id) {
        EventDTO event = eventService.getEventById(id);
        return ResponseEntity.ok(event);
    }

    @GetMapping
    public ResponseEntity<List<EventDTO>> getAllEvents() {
        List<EventDTO> events = eventService.getAllEvents();
        return ResponseEntity.ok(events);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<EventDTO>> getUpcomingEvents() {
        List<EventDTO> events = eventService.getUpcomingEvents();
        return ResponseEntity.ok(events);
    }

    @PostMapping("/{eventId}/register/{userId}")
    public ResponseEntity<EventDTO> registerForEvent(
            @PathVariable Long eventId,
            @PathVariable Long userId) {
        EventDTO event = eventService.registerForEvent(eventId, userId);
        return ResponseEntity.ok(event);
    }

    @DeleteMapping("/{eventId}/unregister/{userId}")
    public ResponseEntity<EventDTO> unregisterFromEvent(
            @PathVariable Long eventId,
            @PathVariable Long userId) {
        EventDTO event = eventService.unregisterFromEvent(eventId, userId);
        return ResponseEntity.ok(event);
    }

    @GetMapping("/organizer/{organizerId}")
    public ResponseEntity<List<EventDTO>> getEventsByOrganizer(@PathVariable Long organizerId) {
        List<EventDTO> events = eventService.getEventsByOrganizer(organizerId);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<EventDTO>> getEventsByDateRange(
            @RequestParam LocalDateTime start,
            @RequestParam LocalDateTime end) {
        List<EventDTO> events = eventService.getEventsByDateRange(start, end);
        return ResponseEntity.ok(events);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
} 