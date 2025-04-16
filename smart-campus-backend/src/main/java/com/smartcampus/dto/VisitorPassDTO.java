package com.smartcampus.dto;

import java.time.LocalDateTime;

public class VisitorPassDTO {
    private Long id;
    private String visitorName;
    private String visitorEmail;
    private String visitorPhone;
    private String purpose;
    private Long hostId;
    private String hostName;
    private LocalDateTime entryTime;
    private LocalDateTime exitTime;
    private String status;
    private String qrCode;
    private String idProofType;
    private String idProofNumber;
    private String vehicleNumber;
    private String remarks;
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    private Long approvedById;
    private String approvedByName;

    // Getters
    public Long getId() {
        return id;
    }

    public String getVisitorName() {
        return visitorName;
    }

    public String getVisitorEmail() {
        return visitorEmail;
    }

    public String getVisitorPhone() {
        return visitorPhone;
    }

    public String getPurpose() {
        return purpose;
    }

    public Long getHostId() {
        return hostId;
    }

    public String getHostName() {
        return hostName;
    }

    public LocalDateTime getEntryTime() {
        return entryTime;
    }

    public LocalDateTime getExitTime() {
        return exitTime;
    }

    public String getStatus() {
        return status;
    }

    public String getQrCode() {
        return qrCode;
    }

    public String getIdProofType() {
        return idProofType;
    }

    public String getIdProofNumber() {
        return idProofNumber;
    }

    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public String getRemarks() {
        return remarks;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getApprovedAt() {
        return approvedAt;
    }

    public Long getApprovedById() {
        return approvedById;
    }

    public String getApprovedByName() {
        return approvedByName;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setVisitorName(String visitorName) {
        this.visitorName = visitorName;
    }

    public void setVisitorEmail(String visitorEmail) {
        this.visitorEmail = visitorEmail;
    }

    public void setVisitorPhone(String visitorPhone) {
        this.visitorPhone = visitorPhone;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public void setHostId(Long hostId) {
        this.hostId = hostId;
    }

    public void setHostName(String hostName) {
        this.hostName = hostName;
    }

    public void setEntryTime(LocalDateTime entryTime) {
        this.entryTime = entryTime;
    }

    public void setExitTime(LocalDateTime exitTime) {
        this.exitTime = exitTime;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setQrCode(String qrCode) {
        this.qrCode = qrCode;
    }

    public void setIdProofType(String idProofType) {
        this.idProofType = idProofType;
    }

    public void setIdProofNumber(String idProofNumber) {
        this.idProofNumber = idProofNumber;
    }

    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setApprovedAt(LocalDateTime approvedAt) {
        this.approvedAt = approvedAt;
    }

    public void setApprovedById(Long approvedById) {
        this.approvedById = approvedById;
    }

    public void setApprovedByName(String approvedByName) {
        this.approvedByName = approvedByName;
    }
} 