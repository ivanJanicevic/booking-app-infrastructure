package com.tours.service;

import com.tours.model.TouristLocation;
import com.tours.repository.TouristLocationRepository;
import org.springframework.stereotype.Service;

@Service
public class TouristLocationService {

    private final TouristLocationRepository touristLocationRepository;

    public TouristLocationService(TouristLocationRepository touristLocationRepository) {
        this.touristLocationRepository = touristLocationRepository;
    }

    public TouristLocation saveOrUpdateLocation(String username, Double latitude, Double longitude) {
        TouristLocation location = touristLocationRepository.findByUsername(username)
                .orElse(new TouristLocation(username, latitude, longitude));
        location.setLatitude(latitude);
        location.setLongitude(longitude);
        return touristLocationRepository.save(location);
    }

    public TouristLocation getCurrentLocation(String username) {
        return touristLocationRepository.findByUsername(username).orElse(null);
    }
}
