package com.tours.repository;

import com.tours.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByTourId(Long tourId); // Pronađi recenzije za određenu turu
    // Uklonjeno: List<Review> findByTouristId(Long touristId);
}