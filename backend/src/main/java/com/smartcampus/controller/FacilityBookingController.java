package com.smartcampus.controller;

import com.smartcampus.dto.FacilityBookingDTO;
import com.smartcampus.service.FacilityBookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}, allowedHeaders = "*", allowCredentials = "true")
@RequestMapping("/api/facility-bookings")
public class FacilityBookingController {

    private final FacilityBookingService bookingService;

    public FacilityBookingController(FacilityBookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping
    public ResponseEntity<List<FacilityBookingDTO>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FacilityBookingDTO> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<FacilityBookingDTO>> getBookingsByTeacher(@PathVariable Long teacherId) {
        return ResponseEntity.ok(bookingService.getBookingsByTeacher(teacherId));
    }

    @GetMapping("/facility/{facilityId}")
    public ResponseEntity<List<FacilityBookingDTO>> getBookingsByFacility(@PathVariable Long facilityId) {
        return ResponseEntity.ok(bookingService.getBookingsByFacility(facilityId));
    }

    @PostMapping
    public ResponseEntity<FacilityBookingDTO> createBooking(@RequestBody FacilityBookingDTO bookingDTO) {
        return ResponseEntity.ok(bookingService.createBooking(bookingDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FacilityBookingDTO> updateBooking(@PathVariable Long id, @RequestBody FacilityBookingDTO bookingDTO) {
        return ResponseEntity.ok(bookingService.updateBooking(id, bookingDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }
} 