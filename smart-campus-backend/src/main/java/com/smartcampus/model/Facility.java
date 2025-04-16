package com.smartcampus.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalTime;

@Data
@Entity
@Table(name = "facilities")
public class Facility {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private String type; // CLASSROOM, LAB, LIBRARY, SPORTS, OTHER

    @Column(nullable = false)
    private Integer capacity;

    @Column(nullable = false)
    private boolean available = true;

    private LocalTime openingTime;

    private LocalTime closingTime;

    private String imageUrl;

    private String amenities;

    @Column(nullable = false)
    private String status; // AVAILABLE, UNDER_MAINTENANCE, CLOSED
} 