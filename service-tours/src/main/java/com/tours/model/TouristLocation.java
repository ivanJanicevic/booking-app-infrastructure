package com.tours.model;

import jakarta.persistence.*;


@Entity
public class TouristLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String username; // Pretpostavljamo da imamo neki ID za korisnika
    private Double latitude;
    private Double longitude;

    // Konstruktori
    public TouristLocation() {
    }

    public TouristLocation(String username, Double latitude, Double longitude) {
        this.username = username;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    // Getteri i Setteri
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUserId() {
        return username;
    }

    public void setUserId(String username) {
        this.username = username;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
}