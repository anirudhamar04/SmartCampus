package com.smartcampus.controller;

import com.smartcampus.dto.AttendanceDTO;
import com.smartcampus.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping
    public ResponseEntity<AttendanceDTO> createAttendance(@RequestBody AttendanceDTO attendanceDTO) {
        return ResponseEntity.ok(attendanceService.createAttendance(attendanceDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AttendanceDTO> updateAttendance(
            @PathVariable Long id,
            @RequestBody AttendanceDTO attendanceDTO) {
        return ResponseEntity.ok(attendanceService.updateAttendance(id, attendanceDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AttendanceDTO> getAttendanceById(@PathVariable Long id) {
        return ResponseEntity.ok(attendanceService.getAttendanceById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AttendanceDTO>> getAttendanceByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(attendanceService.getAttendanceByUser(userId));
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<AttendanceDTO>> getAttendanceByDateRange(
            @RequestParam LocalDateTime start,
            @RequestParam LocalDateTime end) {
        return ResponseEntity.ok(attendanceService.getAttendanceByDateRange(start, end));
    }
} 