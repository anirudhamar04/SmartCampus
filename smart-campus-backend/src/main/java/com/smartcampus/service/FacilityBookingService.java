package com.smartcampus.service;

import com.smartcampus.dto.FacilityBookingDTO;
import com.smartcampus.model.Facility;
import com.smartcampus.model.FacilityBooking;
import com.smartcampus.model.User;
import com.smartcampus.repository.FacilityBookingRepository;
import com.smartcampus.repository.FacilityRepository;
import com.smartcampus.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FacilityBookingService {

    private final FacilityBookingRepository bookingRepository;
    private final FacilityRepository facilityRepository;
    private final UserRepository userRepository;

    public FacilityBookingService(FacilityBookingRepository bookingRepository, 
                                  FacilityRepository facilityRepository,
                                  UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.facilityRepository = facilityRepository;
        this.userRepository = userRepository;
    }

    public List<FacilityBookingDTO> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public FacilityBookingDTO getBookingById(Long id) {
        FacilityBooking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        return convertToDTO(booking);
    }

    public List<FacilityBookingDTO> getBookingsByTeacher(Long teacherId) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        return bookingRepository.findByTeacher(teacher).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<FacilityBookingDTO> getBookingsByFacility(Long facilityId) {
        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new RuntimeException("Facility not found"));
        return bookingRepository.findByFacility(facility).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Check for booking conflicts
    private boolean isTimeSlotAvailable(Long facilityId, LocalDate date, LocalTime startTime, LocalTime endTime, Long excludeBookingId) {
        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new RuntimeException("Facility not found"));
        
        List<FacilityBooking> conflictingBookings;
        if (excludeBookingId != null) {
            conflictingBookings = bookingRepository.findConflictingBookings(facility, date, startTime, endTime, excludeBookingId);
        } else {
            conflictingBookings = bookingRepository.findConflictingBookings(facility, date, startTime, endTime);
        }
        
        return conflictingBookings.isEmpty();
    }

    @Transactional
    public FacilityBookingDTO createBooking(FacilityBookingDTO bookingDTO) {
        // Validate time slot
        if (!isTimeSlotAvailable(bookingDTO.getFacilityId(), bookingDTO.getDate(), 
                bookingDTO.getStartTime(), bookingDTO.getEndTime(), null)) {
            throw new RuntimeException("This time slot is already booked for the selected facility");
        }
        
        FacilityBooking booking = new FacilityBooking();
        Facility facility = facilityRepository.findById(bookingDTO.getFacilityId())
                .orElseThrow(() -> new RuntimeException("Facility not found"));
        User teacher = userRepository.findById(bookingDTO.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        
        booking.setFacility(facility);
        booking.setTeacher(teacher);
        booking.setPurpose(bookingDTO.getPurpose());
        booking.setDate(bookingDTO.getDate());
        booking.setStartTime(bookingDTO.getStartTime());
        booking.setEndTime(bookingDTO.getEndTime());
        booking.setStatus("CONFIRMED");
        booking.setNotes(bookingDTO.getNotes());
        
        FacilityBooking savedBooking = bookingRepository.save(booking);
        return convertToDTO(savedBooking);
    }

    @Transactional
    public FacilityBookingDTO updateBooking(Long id, FacilityBookingDTO bookingDTO) {
        FacilityBooking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Validate time slot for update
        if (!isTimeSlotAvailable(bookingDTO.getFacilityId(), bookingDTO.getDate(), 
                bookingDTO.getStartTime(), bookingDTO.getEndTime(), id)) {
            throw new RuntimeException("This time slot is already booked for the selected facility");
        }
        
        Facility facility = facilityRepository.findById(bookingDTO.getFacilityId())
                .orElseThrow(() -> new RuntimeException("Facility not found"));
        
        booking.setFacility(facility);
        booking.setPurpose(bookingDTO.getPurpose());
        booking.setDate(bookingDTO.getDate());
        booking.setStartTime(bookingDTO.getStartTime());
        booking.setEndTime(bookingDTO.getEndTime());
        booking.setNotes(bookingDTO.getNotes());
        
        FacilityBooking updatedBooking = bookingRepository.save(booking);
        return convertToDTO(updatedBooking);
    }

    @Transactional
    public void deleteBooking(Long id) {
        FacilityBooking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        bookingRepository.delete(booking);
    }

    private FacilityBookingDTO convertToDTO(FacilityBooking booking) {
        FacilityBookingDTO dto = new FacilityBookingDTO();
        dto.setId(booking.getId());
        dto.setFacilityId(booking.getFacility().getId());
        dto.setFacilityName(booking.getFacility().getName());
        dto.setTeacherId(booking.getTeacher().getId());
        dto.setTeacherName(booking.getTeacher().getName());
        dto.setPurpose(booking.getPurpose());
        dto.setDate(booking.getDate());
        dto.setStartTime(booking.getStartTime());
        dto.setEndTime(booking.getEndTime());
        dto.setStatus(booking.getStatus());
        dto.setNotes(booking.getNotes());
        return dto;
    }
} 