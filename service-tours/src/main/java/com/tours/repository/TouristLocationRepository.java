package com.tours.repository;

import com.tours.model.TouristLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TouristLocationRepository extends JpaRepository<TouristLocation, Long> {
    Optional<TouristLocation> findByUsername(String username);
}