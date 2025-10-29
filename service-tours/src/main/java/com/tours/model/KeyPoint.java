package com.tours.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Entity
@Table(name = "key_points")
public class KeyPoint {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Naziv ključne tačke je obavezan")
    @Size(max = 255, message = "Naziv ključne tačke ne može biti duži od 255 karaktera")
    @Column(nullable = false)
    private String naziv;
    
    @NotBlank(message = "Opis ključne tačke je obavezan")
    @Size(max = 1000, message = "Opis ključne tačke ne može biti duži od 1000 karaktera")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String opis;
    
    @NotNull(message = "Geografska širina je obavezna")
    @Column(nullable = false)
    private Double latitude;
    
    @NotNull(message = "Geografska dužina je obavezna")
    @Column(nullable = false)
    private Double longitude;
    
    @Size(max = 500, message = "URL slike ne može biti duži od 500 karaktera")
    @Column(name = "slika_url")
    private String slikaUrl;
    
    @Column(name = "tour_id", nullable = false)
    private Long tourId;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public KeyPoint() {
    }
    
    public KeyPoint(String naziv, String opis, Double latitude, Double longitude, String slikaUrl, Long tourId) {
        this.naziv = naziv;
        this.opis = opis;
        this.latitude = latitude;
        this.longitude = longitude;
        this.slikaUrl = slikaUrl;
        this.tourId = tourId;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getNaziv() {
        return naziv;
    }
    
    public void setNaziv(String naziv) {
        this.naziv = naziv;
    }
    
    public String getOpis() {
        return opis;
    }
    
    public void setOpis(String opis) {
        this.opis = opis;
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
    
    public String getSlikaUrl() {
        return slikaUrl;
    }
    
    public void setSlikaUrl(String slikaUrl) {
        this.slikaUrl = slikaUrl;
    }
    
    public Long getTourId() {
        return tourId;
    }
    
    public void setTourId(Long tourId) {
        this.tourId = tourId;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
