package com.tours.controller;

import com.tours.model.TouristLocation;
import com.tours.service.TouristLocationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tours/tourist-location")
public class TouristLocationController {

    private final TouristLocationService touristLocationService;

    public TouristLocationController(TouristLocationService touristLocationService) {
        this.touristLocationService = touristLocationService;
    }

    // DTO za request body
    static class LocationUpdateRequest {
        public Double latitude;
        public Double longitude;
        public String username; // U realnom sistemu bi userId dolazio iz autentifikacije
    }

    @PostMapping("/update")
    public ResponseEntity<TouristLocation> updateLocation(@RequestBody LocationUpdateRequest request) {
        TouristLocation updatedLocation = touristLocationService.saveOrUpdateLocation(request.username, request.latitude, request.longitude);
        return ResponseEntity.ok(updatedLocation);
    }

    @GetMapping("/current/{username}")
    public ResponseEntity<TouristLocation> getCurrentLocation(@PathVariable String username) {
        TouristLocation location = touristLocationService.getCurrentLocation(username);
        if (location != null) {
            return ResponseEntity.ok(location);
        }
        return ResponseEntity.notFound().build();
    }
}