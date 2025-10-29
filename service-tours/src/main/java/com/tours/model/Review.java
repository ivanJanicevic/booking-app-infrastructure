package com.tours.model;

import com.tours.model.Tour;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "reviews") // Naziv tabele u bazi
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer rating; // 1-5

    @Column(nullable = false, length = 1000)
    private String comment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tour_id", nullable = false)
    private Tour tour;

    @Column(nullable = false)
    private String touristName; // Ime turiste, kao string

    @Column(nullable = false)
    private LocalDate dateVisited; // Datum kada je turista posetio turu

    @Column(nullable = false)
    private LocalDateTime datePosted; // Datum kada je recenzija objavljena

    @ElementCollection
    @CollectionTable(name = "review_images", joinColumns = @JoinColumn(name = "review_id"))
    @Column(name = "image_url")
    private List<String> images;

    // Konstruktori, Getteri i Setteri

    public Review() {
    }

    public Review(Integer rating, String comment, Tour tour, String touristName, LocalDate dateVisited, LocalDateTime datePosted, List<String> images) {
        this.rating = rating;
        this.comment = comment;
        this.tour = tour;
        this.touristName = touristName;
        this.dateVisited = dateVisited;
        this.datePosted = datePosted;
        this.images = images;
    }

    // Getteri i Setteri
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public Tour getTour() { return tour; }
    public void setTour(Tour tour) { this.tour = tour; }

    public String getTouristName() { return touristName; } // Getter za ime
    public void setTouristName(String touristName) { this.touristName = touristName; } // Setter za ime

    public LocalDate getDateVisited() { return dateVisited; }
    public void setDateVisited(LocalDate dateVisited) { this.dateVisited = dateVisited; }

    public LocalDateTime getDatePosted() { return datePosted; }
    public void setDatePosted(LocalDateTime datePosted) { this.datePosted = datePosted; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }
}