package com.smartcampus.dto;

import java.time.LocalDate;
import java.util.List;

public class CourseDTO {
    private Long id;
    private String name;
    private String courseCode;
    private String description;
    private String department;
    private Integer credits;
    private String semester;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer capacity;
    private String location;
    private String schedule;
    private List<UserDTO> enrolledStudents;
    private List<UserDTO> assignedTeachers;
    private Integer enrollmentCount;
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getCourseCode() {
        return courseCode;
    }
    
    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getDepartment() {
        return department;
    }
    
    public void setDepartment(String department) {
        this.department = department;
    }
    
    public Integer getCredits() {
        return credits;
    }
    
    public void setCredits(Integer credits) {
        this.credits = credits;
    }
    
    public String getSemester() {
        return semester;
    }
    
    public void setSemester(String semester) {
        this.semester = semester;
    }
    
    public LocalDate getStartDate() {
        return startDate;
    }
    
    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }
    
    public LocalDate getEndDate() {
        return endDate;
    }
    
    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }
    
    public Integer getCapacity() {
        return capacity;
    }
    
    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public String getSchedule() {
        return schedule;
    }
    
    public void setSchedule(String schedule) {
        this.schedule = schedule;
    }
    
    public List<UserDTO> getEnrolledStudents() {
        return enrolledStudents;
    }
    
    public void setEnrolledStudents(List<UserDTO> enrolledStudents) {
        this.enrolledStudents = enrolledStudents;
    }
    
    public List<UserDTO> getAssignedTeachers() {
        return assignedTeachers;
    }
    
    public void setAssignedTeachers(List<UserDTO> assignedTeachers) {
        this.assignedTeachers = assignedTeachers;
    }
    
    public Integer getEnrollmentCount() {
        return enrollmentCount;
    }
    
    public void setEnrollmentCount(Integer enrollmentCount) {
        this.enrollmentCount = enrollmentCount;
    }
} 