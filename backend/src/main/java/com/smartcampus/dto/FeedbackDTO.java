package com.smartcampus.dto;

import java.time.LocalDateTime;

public class FeedbackDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String subject;
    private String message;
    private String category;
    private LocalDateTime submissionTime;
    private String status;
    private String priority;
    private String response;
    private LocalDateTime responseTime;
    private Long respondedById;
    private String respondedByName;

    // Getters
    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUserName() {
        return userName;
    }

    public String getSubject() {
        return subject;
    }

    public String getMessage() {
        return message;
    }

    public String getCategory() {
        return category;
    }

    public LocalDateTime getSubmissionTime() {
        return submissionTime;
    }

    public String getStatus() {
        return status;
    }

    public String getPriority() {
        return priority;
    }

    public String getResponse() {
        return response;
    }

    public LocalDateTime getResponseTime() {
        return responseTime;
    }

    public Long getRespondedById() {
        return respondedById;
    }

    public String getRespondedByName() {
        return respondedByName;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setSubmissionTime(LocalDateTime submissionTime) {
        this.submissionTime = submissionTime;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public void setResponse(String response) {
        this.response = response;
    }

    public void setResponseTime(LocalDateTime responseTime) {
        this.responseTime = responseTime;
    }

    public void setRespondedById(Long respondedById) {
        this.respondedById = respondedById;
    }

    public void setRespondedByName(String respondedByName) {
        this.respondedByName = respondedByName;
    }
} 