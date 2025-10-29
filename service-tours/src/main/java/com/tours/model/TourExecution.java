// com.tours.model.TourExecution.java
package com.tours.model;

import com.tours.enums.TourExecutionStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "tour_executions")
public class TourExecution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "tour_id", nullable = false)
    private Long tourId;

    @NotNull
    @Column(name = "tourist_username", nullable = false)
    private String touristUsername;

    @Enumerated(EnumType.STRING)
    @NotNull
    @Column(name = "status", nullable = false)
    private TourExecutionStatus status; // STARTED, COMPLETED, ABANDONED

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    // Current location of the tourist
    @Column(name = "current_latitude")
    private Double currentLatitude;

    @Column(name = "current_longitude")
    private Double currentLongitude;

    @Column(name = "last_activity_time", nullable = false)
    private LocalDateTime lastActivityTime;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "tour_execution_completed_key_points", joinColumns = @JoinColumn(name = "tour_execution_id"))
    @Column(name = "key_point_id")
    private Set<Long> completedKeyPoints = new HashSet<>();

    public TourExecution() {
    }

    public TourExecution(Long tourId, String touristUsername, Double initialLatitude, Double initialLongitude) {
        this.tourId = tourId;
        this.touristUsername = touristUsername;
        this.status = TourExecutionStatus.STARTED;
        this.startTime = LocalDateTime.now();
        this.lastActivityTime = LocalDateTime.now();
        this.currentLatitude = initialLatitude;
        this.currentLongitude = initialLongitude;
    }

    @PrePersist
    protected void onCreate() {
        if (startTime == null) startTime = LocalDateTime.now();
        if (lastActivityTime == null) lastActivityTime = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTourId() {
        return tourId;
    }

    public void setTourId(Long tourId) {
        this.tourId = tourId;
    }

    public String getTouristUsername() {
        return touristUsername;
    }

    public void setTouristUsername(String touristUsername) {
        this.touristUsername = touristUsername;
    }

    public TourExecutionStatus getStatus() {
        return status;
    }

    public void setStatus(TourExecutionStatus status) {
        this.status = status;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public Double getCurrentLatitude() {
        return currentLatitude;
    }

    public void setCurrentLatitude(Double currentLatitude) {
        this.currentLatitude = currentLatitude;
    }

    public Double getCurrentLongitude() {
        return currentLongitude;
    }

    public void setCurrentLongitude(Double currentLongitude) {
        this.currentLongitude = currentLongitude;
    }

    public LocalDateTime getLastActivityTime() {
        return lastActivityTime;
    }

    public void setLastActivityTime(LocalDateTime lastActivityTime) {
        this.lastActivityTime = lastActivityTime;
    }

    public Set<Long> getCompletedKeyPoints() {
        return completedKeyPoints;
    }

    public void setCompletedKeyPoints(Set<Long> completedKeyPoints) {
        this.completedKeyPoints = completedKeyPoints;
    }

    public void addCompletedKeyPoint(Long keyPointId) {
        this.completedKeyPoints.add(keyPointId);
    }
}