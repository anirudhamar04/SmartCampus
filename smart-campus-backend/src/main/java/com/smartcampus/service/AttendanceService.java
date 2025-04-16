package com.smartcampus.service;

import com.smartcampus.dto.AttendanceDTO;
import com.smartcampus.model.Attendance;
import com.smartcampus.model.User;
import com.smartcampus.repository.AttendanceRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;

    @Transactional
    public AttendanceDTO createAttendance(AttendanceDTO attendanceDTO) {
        User user = userRepository.findById(attendanceDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Attendance attendance = new Attendance();
        attendance.setUser(user);
        attendance.setCheckInTime(attendanceDTO.getCheckInTime());
        attendance.setCheckOutTime(attendanceDTO.getCheckOutTime());
        attendance.setLocation(attendanceDTO.getLocation());
        attendance.setStatus(attendanceDTO.getStatus());
        attendance.setRemarks(attendanceDTO.getRemarks());

        Attendance savedAttendance = attendanceRepository.save(attendance);
        return convertToDTO(savedAttendance);
    }

    @Transactional
    public AttendanceDTO updateAttendance(Long id, AttendanceDTO attendanceDTO) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attendance record not found"));

        attendance.setCheckInTime(attendanceDTO.getCheckInTime());
        attendance.setCheckOutTime(attendanceDTO.getCheckOutTime());
        attendance.setLocation(attendanceDTO.getLocation());
        attendance.setStatus(attendanceDTO.getStatus());
        attendance.setRemarks(attendanceDTO.getRemarks());

        Attendance updatedAttendance = attendanceRepository.save(attendance);
        return convertToDTO(updatedAttendance);
    }

    public AttendanceDTO getAttendanceById(Long id) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attendance record not found"));
        return convertToDTO(attendance);
    }

    public List<AttendanceDTO> getAttendanceByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return attendanceRepository.findByUser(user).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<AttendanceDTO> getAttendanceByDateRange(LocalDateTime start, LocalDateTime end) {
        return attendanceRepository.findByCheckInTimeBetween(start, end).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private AttendanceDTO convertToDTO(Attendance attendance) {
        AttendanceDTO dto = new AttendanceDTO();
        dto.setId(attendance.getId());
        dto.setUserId(attendance.getUser().getId());
        dto.setUserName(attendance.getUser().getFullName());
        dto.setCheckInTime(attendance.getCheckInTime());
        dto.setCheckOutTime(attendance.getCheckOutTime());
        dto.setLocation(attendance.getLocation());
        dto.setStatus(attendance.getStatus());
        dto.setRemarks(attendance.getRemarks());
        return dto;
    }
} 