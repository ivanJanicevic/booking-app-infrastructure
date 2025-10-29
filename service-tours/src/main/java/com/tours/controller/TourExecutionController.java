// com.tours.controller.TourExecutionController.java
package com.tours.controller;

import com.tours.enums.TourExecutionStatus;
import com.tours.model.TourExecution;
import com.tours.service.TourExecutionService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/tours/tour-execution")
public class TourExecutionController {

    private final TourExecutionService tourExecutionService;
    private final HttpServletRequest httpServletRequest; // Za dobijanje username-a iz headera

    @Autowired
    public TourExecutionController(TourExecutionService tourExecutionService, HttpServletRequest httpServletRequest) {
        this.tourExecutionService = tourExecutionService;
        this.httpServletRequest = httpServletRequest;
    }

    private String getCurrentUsername() {
        String username = httpServletRequest.getHeader("X-Username");
        if (username != null && !username.isEmpty()) {
            return username;
        }
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            return authentication.getName();
        }
        return null;
    }

    @PostMapping("/start")
    public ResponseEntity<?> startTour(@RequestBody Map<String, Object> request) {
        String touristUsername = getCurrentUsername();
        if (touristUsername == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Korisnik nije autentifikovan."));
        }

        try {
            Long tourId = Long.valueOf(request.get("tourId").toString());
            Double initialLatitude = Double.valueOf(request.get("initialLatitude").toString());
            Double initialLongitude = Double.valueOf(request.get("initialLongitude").toString());

            TourExecution execution = tourExecutionService.startTour(tourId, touristUsername, initialLatitude, initialLongitude);
            return ResponseEntity.status(HttpStatus.CREATED).body(execution);
        } catch (IllegalArgumentException | IllegalStateException | SecurityException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Greška pri pokretanju ture: " + e.getMessage()));
        }
    }

    @GetMapping("/active")
    public ResponseEntity<?> getActiveTourExecution() {
        String touristUsername = getCurrentUsername();
        if (touristUsername == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Korisnik nije autentifikovan."));
        }

        Optional<TourExecution> execution = tourExecutionService.getActiveTourExecution(touristUsername);
        if (execution.isPresent()) {
            return ResponseEntity.ok(execution.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Nema aktivnih tura za ovog korisnika."));
        }
    }

    @PutMapping("/{executionId}/update-location")
    public ResponseEntity<?> updateLocationAndCheckKeyPoints(
            @PathVariable Long executionId,
            @RequestBody Map<String, Object> request) {
        String touristUsername = getCurrentUsername();
        if (touristUsername == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Korisnik nije autentifikovan."));
        }

        try {
            Double newLatitude = Double.valueOf(request.get("latitude").toString());
            Double newLongitude = Double.valueOf(request.get("longitude").toString());

            TourExecution updatedExecution = tourExecutionService.updateTouristPositionAndCheckKeyPoints(
                    executionId, touristUsername, newLatitude, newLongitude);
            return ResponseEntity.ok(updatedExecution);
        } catch (IllegalArgumentException | IllegalStateException | SecurityException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Greška pri ažuriranju lokacije i proveri ključnih tačaka: " + e.getMessage()));
        }
    }

    @PutMapping("/{executionId}/complete")
    public ResponseEntity<?> completeTour(@PathVariable Long executionId) {
        String touristUsername = getCurrentUsername();
        if (touristUsername == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Korisnik nije autentifikovan."));
        }

        try {
            TourExecution completedExecution = tourExecutionService.completeTour(executionId, touristUsername);
            return ResponseEntity.ok(completedExecution);
        } catch (IllegalArgumentException | IllegalStateException | SecurityException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Greška pri završavanju ture: " + e.getMessage()));
        }
    }

    @PutMapping("/{executionId}/abandon")
    public ResponseEntity<?> abandonTour(@PathVariable Long executionId) {
        String touristUsername = getCurrentUsername();
        if (touristUsername == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Korisnik nije autentifikovan."));
        }

        try {
            TourExecution abandonedExecution = tourExecutionService.abandonTour(executionId, touristUsername);
            return ResponseEntity.ok(abandonedExecution);
        } catch (IllegalArgumentException | IllegalStateException | SecurityException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Greška pri napuštanju ture: " + e.getMessage()));
        }
    }
}