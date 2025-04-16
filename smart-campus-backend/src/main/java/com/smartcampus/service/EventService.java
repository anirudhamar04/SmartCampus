package com.smartcampus.service;

import com.smartcampus.dto.EventDTO;
import com.smartcampus.model.Event;
import com.smartcampus.model.User;
import com.smartcampus.repository.EventRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;

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

    @Transactional
    public EventDTO updateEvent(Long id, EventDTO eventDTO) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        event.setTitle(eventDTO.getTitle());
        event.setDescription(eventDTO.getDescription());
        event.setStartTime(eventDTO.getStartTime());
        event.setEndTime(eventDTO.getEndTime());
        event.setLocation(eventDTO.getLocation());
        event.setImageUrl(eventDTO.getImageUrl());
        event.setMaxParticipants(eventDTO.getMaxParticipants());
        event.setRegistrationDeadline(eventDTO.getRegistrationDeadline());
        event.setEventType(eventDTO.getEventType());

        Event updatedEvent = eventRepository.save(event);
        return convertToDTO(updatedEvent);
    }

    @Transactional
    public EventDTO registerParticipant(Long eventId, Long userId) {
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

    public EventDTO getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        return convertToDTO(event);
    }

    public List<EventDTO> getEventsByOrganizer(Long organizerId) {
        User organizer = userRepository.findById(organizerId)
                .orElseThrow(() -> new RuntimeException("Organizer not found"));
        return eventRepository.findByOrganizer(organizer).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<EventDTO> getEventsByDateRange(LocalDateTime start, LocalDateTime end) {
        return eventRepository.findByStartTimeBetween(start, end).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
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
        dto.setParticipantIds(event.getParticipants().stream()
                .map(User::getId)
                .collect(Collectors.toList()));
        dto.setParticipantNames(event.getParticipants().stream()
                .map(User::getFullName)
                .collect(Collectors.toList()));
        dto.setStatus(event.getStatus());
        dto.setImageUrl(event.getImageUrl());
        dto.setMaxParticipants(event.getMaxParticipants());
        dto.setRegistrationDeadline(event.getRegistrationDeadline());
        dto.setEventType(event.getEventType());
        return dto;
    }
} 