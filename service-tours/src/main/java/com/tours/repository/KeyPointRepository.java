package com.tours.repository;

import com.tours.model.KeyPoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KeyPointRepository extends JpaRepository<KeyPoint, Long> {
    
    List<KeyPoint> findByTourId(Long tourId);
    
    @Query("SELECT kp FROM KeyPoint kp JOIN Tour t ON kp.tourId = t.id WHERE t.autorUsername = :autorUsername")
    List<KeyPoint> findByAuthorUsername(@Param("autorUsername") String autorUsername);
    
    @Query("SELECT kp FROM KeyPoint kp JOIN Tour t ON kp.tourId = t.id WHERE kp.tourId = :tourId AND t.autorUsername = :autorUsername")
    List<KeyPoint> findByTourIdAndAuthorUsername(@Param("tourId") Long tourId, @Param("autorUsername") String autorUsername);
    
    @Query("SELECT kp FROM KeyPoint kp JOIN Tour t ON kp.tourId = t.id WHERE kp.id = :keyPointId AND t.autorUsername = :autorUsername")
    java.util.Optional<KeyPoint> findByIdAndAuthorUsername(@Param("keyPointId") Long keyPointId, @Param("autorUsername") String autorUsername);
    
    long countByTourId(Long tourId);
    
    @Query("SELECT COUNT(kp) FROM KeyPoint kp JOIN Tour t ON kp.tourId = t.id WHERE t.autorUsername = :autorUsername")
    long countByAuthorUsername(@Param("autorUsername") String autorUsername);
    
    java.util.Optional<KeyPoint> findFirstByTourIdOrderByCreatedAtAsc(Long tourId);
}

