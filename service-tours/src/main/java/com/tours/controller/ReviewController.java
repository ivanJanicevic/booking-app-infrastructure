package com.tours.controller;

import com.tours.dto.CreateReviewRequest;
import com.tours.model.Review;
import com.tours.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tours/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    @Autowired
    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<Review> createReview(@RequestBody CreateReviewRequest request) {
        Review newReview = reviewService.createReview(request);
        return new ResponseEntity<>(newReview, HttpStatus.CREATED);
    }

    @GetMapping("/tour/{tourId}")
    public ResponseEntity<List<Review>> getReviewsForTour(@PathVariable Long tourId) {
        List<Review> reviews = reviewService.getReviewsByTourId(tourId);
        return ResponseEntity.ok(reviews);
    }

    // Dodaj druge endpoint-e po potrebi
}