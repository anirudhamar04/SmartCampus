package com.smartcampus.dto;

import java.time.LocalDateTime;

public class LostFoundItemDTO {
    private Long id;
    private String itemName;
    private String description;
    private String locationFound;
    private LocalDateTime dateFound;
    private Long foundById;
    private String foundByName;
    private Long claimedById;
    private String claimedByName;
    private String status;
    private String category;
    private String imageUrl;
    private LocalDateTime claimDate;
    private String verificationDetails;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocationFound() {
        return locationFound;
    }

    public void setLocationFound(String locationFound) {
        this.locationFound = locationFound;
    }

    public LocalDateTime getDateFound() {
        return dateFound;
    }

    public void setDateFound(LocalDateTime dateFound) {
        this.dateFound = dateFound;
    }

    public Long getFoundById() {
        return foundById;
    }

    public void setFoundById(Long foundById) {
        this.foundById = foundById;
    }

    public String getFoundByName() {
        return foundByName;
    }

    public void setFoundByName(String foundByName) {
        this.foundByName = foundByName;
    }

    public Long getClaimedById() {
        return claimedById;
    }

    public void setClaimedById(Long claimedById) {
        this.claimedById = claimedById;
    }

    public String getClaimedByName() {
        return claimedByName;
    }

    public void setClaimedByName(String claimedByName) {
        this.claimedByName = claimedByName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public LocalDateTime getClaimDate() {
        return claimDate;
    }

    public void setClaimDate(LocalDateTime claimDate) {
        this.claimDate = claimDate;
    }

    public String getVerificationDetails() {
        return verificationDetails;
    }

    public void setVerificationDetails(String verificationDetails) {
        this.verificationDetails = verificationDetails;
    }
} 