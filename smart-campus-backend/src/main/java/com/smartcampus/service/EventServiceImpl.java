package com.smartcampus.service;

import com.smartcampus.dto.EventDTO;
import com.smartcampus.model.Event;
import com.smartcampus.model.User;
import com.smartcampus.repository.EventRepository;
import com.smartcampus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    @Autowired
    public EventServiceImpl(EventRepository eventRepository, UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public EventDTO createEvent(EventDTO eventDTO) {
        User organizer = userRepository.findById(eventDTO.getOrganizerId())
            .orElseThrow(() -> new RuntimeException("Organizer not found"));

        Event event = new Event();
        event.setTitle(eventDTO.getTitle());
        event.setDescription(eventDTO.getDescription());
        event.setStartTime(eventDTO.getStartTime());
        event.setEndTime(eventDTO.getEndTime());
        event.setLocation(eventDTO.getLocation());
        event.setOrganizer(organizer);
        event.setStatus("UPCOMING");
        event.setImageUrl(eventDTO.getImageUrl());
        event.setMaxParticipants(eventDTO.getMaxParticipants());
        event.setRegistrationDeadline(eventDTO.getRegistrationDeadline());
        event.setEventType(eventDTO.getEventType());

        Event savedEvent = eventRepository.save(event);
        return convertToDTO(savedEvent);
    }

    @Override
    @Transactional
    public EventDTO updateEvent(Long id, EventDTO eventDTO) {
        Event event = eventRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Event not found"));

        event.setTitle(eventDTO.getTitle());
        event.setDescription(eventDTO.getDescription());
        
        // Handle possible field name differences from frontend
        if (eventDTO.getStartTime() != null) {
            event.setStartTime(eventDTO.getStartTime());
        } else if (eventDTO.getStartDate() != null) {
            event.setStartTime(eventDTO.getStartDate());
        }
        
        if (eventDTO.getEndTime() != null) {
            event.setEndTime(eventDTO.getEndTime());
        } else if (eventDTO.getEndDate() != null) {
            event.setEndTime(eventDTO.getEndDate());
        }
        
        // Ensure we don't have null in required fields
        if (event.getStartTime() == null) {
            throw new IllegalArgumentException("Start time/date cannot be null");
        }
        
        if (event.getEndTime() == null) {
            // If we still don't have an end time, set it to start time + 1 hour as a default
            event.setEndTime(event.getStartTime().plusHours(1));
        }
        
        event.setLocation(eventDTO.getLocation());
        event.setImageUrl(eventDTO.getImageUrl());
        event.setMaxParticipants(eventDTO.getMaxParticipants());
        event.setRegistrationDeadline(eventDTO.getRegistrationDeadline());
        event.setEventType(eventDTO.getEventType());

        Event updatedEvent = eventRepository.save(event);
        return convertToDTO(updatedEvent);
    }

    @Override
    public EventDTO getEventById(Long id) {
        Event event = eventRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Event not found"));
        return convertToDTO(event);
    }

    @Override
    public List<EventDTO> getAllEvents() {
        return eventRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public List<EventDTO> getUpcomingEvents() {
        return eventRepository.findByStartTimeAfter(LocalDateTime.now()).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public EventDTO registerForEvent(Long eventId, Long userId) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new RuntimeException("Event not found"));
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (event.getParticipants().contains(user)) {
            throw new RuntimeException("User is already registered for this event");
        }

        if (event.getMaxParticipants() != null && 
            event.getParticipants().size() >= event.getMaxParticipants()) {
            throw new RuntimeException("Event is full");
        }

        event.getParticipants().add(user);
        Event updatedEvent = eventRepository.save(event);
        return convertToDTO(updatedEvent);
    }

    @Override
    @Transactional
    public EventDTO unregisterFromEvent(Long eventId, Long userId) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new RuntimeException("Event not found"));
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (!event.getParticipants().contains(user)) {
            throw new RuntimeException("User is not registered for this event");
        }

        event.getParticipants().remove(user);
        Event updatedEvent = eventRepository.save(event);
        return convertToDTO(updatedEvent);
    }

    @Override
    public List<EventDTO> getEventsByOrganizer(Long organizerId) {
        User organizer = userRepository.findById(organizerId)
            .orElseThrow(() -> new RuntimeException("Organizer not found"));
        
        return eventRepository.findByOrganizer(organizer).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public List<EventDTO> getEventsByDateRange(LocalDateTime start, LocalDateTime end) {
        return eventRepository.findByStartTimeBetween(start, end).stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteEvent(Long id) {
        Event event = eventRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Event not found"));
        
        eventRepository.delete(event);
    }

    private EventDTO convertToDTO(Event event) {
        EventDTO dto = new EventDTO();
        dto.setId(event.getId());
        dto.setTitle(event.getTitle());
        dto.setDescription(event.getDescription());
        dto.setStartTime(event.getStartTime());
        dto.setEndTime(event.getEndTime());
        dto.setLocation(event.getLocation());
        dto.setOrganizerId(event.getOrganizer().getId());
        dto.setOrganizerName(event.getOrganizer().getFullName());
        dto.setStatus(event.getStatus());
        dto.setImageUrl(event.getImageUrl());
        dto.setMaxParticipants(event.getMaxParticipants());
        dto.setRegistrationDeadline(event.getRegistrationDeadline());
        dto.setEventType(event.getEventType());
        
        dto.setParticipantIds(event.getParticipants().stream()
            .map(User::getId)
            .collect(Collectors.toList()));
        
        dto.setParticipantNames(event.getParticipants().stream()
            .map(User::getFullName)
            .collect(Collectors.toList()));
        
        return dto;
    }
} 