package com.tours.repository;

import com.tours.enums.TourStatus;
import com.tours.model.Tour;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TourRepository extends JpaRepository<Tour, Long> {

    List<Tour> findByAutorUsername(String autorUsername);

    List<Tour> findByAutorUsernameAndStatus(String autorUsername, String status);

    List<Tour> findByAutorUsernameAndTezina(String autorUsername, String tezina);

    @Query("SELECT t FROM Tour t WHERE t.tagovi LIKE %:tag% AND t.autorUsername = :autorUsername")
    List<Tour> findByTagAndAutorUsername(@Param("tag") String tag, @Param("autorUsername") String autorUsername);

    long countByAutorUsername(String autorUsername);

    long countByAutorUsernameAndStatus(String autorUsername, String status);

    List<Tour> findByStatus(TourStatus status);
}