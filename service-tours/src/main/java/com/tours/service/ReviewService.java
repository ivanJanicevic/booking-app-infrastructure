package com.tours.service;

import com.tours.dto.CreateReviewRequest;
import com.tours.model.Review;
import com.tours.model.Tour;
import com.tours.repository.ReviewRepository;
import com.tours.repository.TourRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final TourRepository tourRepository;

    @Autowired
    public ReviewService(ReviewRepository reviewRepository, TourRepository tourRepository) {
        this.reviewRepository = reviewRepository;
        this.tourRepository = tourRepository;
    }

    public Review createReview(CreateReviewRequest request) {
        Tour tour = tourRepository.findById(request.getTourId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tour not found with ID: " + request.getTourId()));

        Review review = new Review();
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setTour(tour);
        review.setTouristName(request.getTouristName()); // Postavi ime turiste iz requesta
        review.setDateVisited(request.getDateVisited());
        review.setDatePosted(LocalDateTime.now());
        review.setImages(request.getImages());

        return reviewRepository.save(review);
    }

    public List<Review> getReviewsByTourId(Long tourId) {
        return reviewRepository.findByTourId(tourId);
    }

    // Dodaj druge metode po potrebi
}