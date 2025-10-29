// com.tours.repository.TourExecutionRepository.java
package com.tours.repository;

import com.tours.enums.TourExecutionStatus;
import com.tours.model.TourExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TourExecutionRepository extends JpaRepository<TourExecution, Long> {
    Optional<TourExecution> findByTouristUsernameAndStatus(String touristUsername, TourExecutionStatus status);
    List<TourExecution> findByTourId(Long tourId);
    List<TourExecution> findByTouristUsername(String touristUsername);
}