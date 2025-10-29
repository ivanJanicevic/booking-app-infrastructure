package com.tours.dto;

import java.time.LocalDate;
import java.util.List;

public class CreateReviewRequest {
    private Integer rating;
    private String comment;
    private Long tourId;
    private String touristName; // Dodato
    private LocalDate dateVisited;
    private List<String> images;

    // Konstruktor
    public CreateReviewRequest() {}

    // Getteri i Setteri
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public Long getTourId() { return tourId; }
    public void setTourId(Long tourId) { this.tourId = tourId; }

    public String getTouristName() { return touristName; } // Getter za ime
    public void setTouristName(String touristName) { this.touristName = touristName; } // Setter za ime

    public LocalDate getDateVisited() { return dateVisited; }
    public void setDateVisited(LocalDate dateVisited) { this.dateVisited = dateVisited; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }
}
