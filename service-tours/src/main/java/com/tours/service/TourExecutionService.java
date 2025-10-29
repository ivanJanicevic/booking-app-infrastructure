// com.tours.service.TourExecutionService.java
package com.tours.service;

import com.tours.enums.TourExecutionStatus;
import com.tours.model.KeyPoint;
import com.tours.model.Tour;
import com.tours.model.TourExecution;
import com.tours.repository.KeyPointRepository;
import com.tours.repository.TourExecutionRepository;
import com.tours.repository.TourRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class TourExecutionService {

    private final TourExecutionRepository tourExecutionRepository;
    private final TourRepository tourRepository;
    private final KeyPointRepository keyPointRepository;
    private final TouristLocationService positionSimulatorService; // Za interakciju sa Position Simulatorom

    // Threshold for considering a tourist "near" a key point (e.g., 50 meters)
    private static final double DISTANCE_THRESHOLD_METERS = 300.0;

    @Autowired
    public TourExecutionService(TourExecutionRepository tourExecutionRepository,
                                TourRepository tourRepository,
                                KeyPointRepository keyPointRepository,
                                TouristLocationService positionSimulatorService) {
        this.tourExecutionRepository = tourExecutionRepository;
        this.tourRepository = tourRepository;
        this.keyPointRepository = keyPointRepository;
        this.positionSimulatorService = positionSimulatorService;
    }

    public TourExecution startTour(Long tourId, String touristUsername, Double initialLatitude, Double initialLongitude) {
        // Proveri da li tura postoji i da li je objavljena/arhivirana
        Optional<Tour> tourOptional = tourRepository.findById(tourId);
        if (tourOptional.isEmpty()) {
            throw new IllegalArgumentException("Tura sa ID " + tourId + " nije pronađena.");
        }
        Tour tour = tourOptional.get();
        if (tour.getStatus() != com.tours.enums.TourStatus.PUBLISHED && tour.getStatus() != com.tours.enums.TourStatus.ARCHIVED) {
            throw new IllegalArgumentException("Tura nije objavljena niti arhivirana i ne može se pokrenuti.");
        }
        // TODO: Proveriti da li je tura kupljena (kada se implementira kupovina)

        // Proveri da li turista već ima aktivnu turu
        Optional<TourExecution> activeExecution = tourExecutionRepository.findByTouristUsernameAndStatus(touristUsername, TourExecutionStatus.STARTED);
        if (activeExecution.isPresent()) {
            throw new IllegalStateException("Turista već ima aktivnu turu. Završite prethodnu pre nego što pokrenete novu.");
        }

        TourExecution newExecution = new TourExecution(tourId, touristUsername, initialLatitude, initialLongitude);
        // Ažuriraj lokaciju turiste u Position Simulatoru
        positionSimulatorService.saveOrUpdateLocation(touristUsername, initialLatitude, initialLongitude);
        return tourExecutionRepository.save(newExecution);
    }

    public Optional<TourExecution> getActiveTourExecution(String touristUsername) {
        return tourExecutionRepository.findByTouristUsernameAndStatus(touristUsername, TourExecutionStatus.STARTED);
    }

    public TourExecution completeTour(Long executionId, String touristUsername) {
        Optional<TourExecution> executionOptional = tourExecutionRepository.findById(executionId);
        if (executionOptional.isEmpty()) {
            throw new IllegalArgumentException("Izvršenje ture sa ID " + executionId + " nije pronađeno.");
        }

        TourExecution execution = executionOptional.get();
        if (!execution.getTouristUsername().equals(touristUsername)) {
            throw new SecurityException("Nemate ovlašćenje da završite ovu turu.");
        }
        if (execution.getStatus() != TourExecutionStatus.STARTED) {
            throw new IllegalStateException("Tura već nije aktivna (status: " + execution.getStatus() + ").");
        }

        execution.setStatus(TourExecutionStatus.COMPLETED);
        execution.setEndTime(LocalDateTime.now());
        execution.setLastActivityTime(LocalDateTime.now());
        return tourExecutionRepository.save(execution);
    }

    public TourExecution abandonTour(Long executionId, String touristUsername) {
        Optional<TourExecution> executionOptional = tourExecutionRepository.findById(executionId);
        if (executionOptional.isEmpty()) {
            throw new IllegalArgumentException("Izvršenje ture sa ID " + executionId + " nije pronađeno.");
        }

        TourExecution execution = executionOptional.get();
        if (!execution.getTouristUsername().equals(touristUsername)) {
            throw new SecurityException("Nemate ovlašćenje da napustite ovu turu.");
        }
        if (execution.getStatus() != TourExecutionStatus.STARTED) {
            throw new IllegalStateException("Tura već nije aktivna (status: " + execution.getStatus() + ").");
        }

        execution.setStatus(TourExecutionStatus.ABANDONED);
        execution.setEndTime(LocalDateTime.now());
        execution.setLastActivityTime(LocalDateTime.now());
        return tourExecutionRepository.save(execution);
    }

    public TourExecution updateTouristPositionAndCheckKeyPoints(
            Long executionId, String touristUsername, Double newLatitude, Double newLongitude) {

        Optional<TourExecution> executionOptional = tourExecutionRepository.findById(executionId);
        if (executionOptional.isEmpty()) {
            throw new IllegalArgumentException("Izvršenje ture sa ID " + executionId + " nije pronađeno.");
        }
        TourExecution execution = executionOptional.get();

        if (!execution.getTouristUsername().equals(touristUsername)) {
            throw new SecurityException("Nemate ovlašćenje da ažurirate ovu turu.");
        }
        if (execution.getStatus() != TourExecutionStatus.STARTED) {
            throw new IllegalStateException("Tura nije aktivna.");
        }

        // Ažuriraj trenutnu lokaciju u TourExecution
        execution.setCurrentLatitude(newLatitude);
        execution.setCurrentLongitude(newLongitude);
        execution.setLastActivityTime(LocalDateTime.now());

        // Ažuriraj lokaciju turiste u Position Simulatoru
        positionSimulatorService.saveOrUpdateLocation(touristUsername, newLatitude, newLongitude);

        // Proveri da li je turista stigao do neke ključne tačke
        List<KeyPoint> tourKeyPoints = keyPointRepository.findByTourId(execution.getTourId());
        Set<Long> completedKeyPoints = execution.getCompletedKeyPoints();

        boolean allKeyPointsCompleted = true; // Pretpostavka da su sve ključne tačke završene
        for (KeyPoint kp : tourKeyPoints) {
            if (!completedKeyPoints.contains(kp.getId())) {
                double distance = calculateDistance(newLatitude, newLongitude, kp.getLatitude(), kp.getLongitude());
                if (distance <= DISTANCE_THRESHOLD_METERS) {
                    execution.addCompletedKeyPoint(kp.getId());
                    // Možda dodati logiku za beleženje vremena dostizanja KP ako je potrebno
                    System.out.println("Turista " + touristUsername + " je dostigao ključnu tačku: " + kp.getNaziv());
                } else {
                    allKeyPointsCompleted = false; // Ako postoji neka nekompletirana i nije blizu, onda nisu sve završene
                }
            }
        }
        // Ako su sve ključne tačke kompletirane, promeni status ture u COMPLETED
        if (allKeyPointsCompleted && tourKeyPoints.size() == completedKeyPoints.size() && !tourKeyPoints.isEmpty()) {
            execution.setStatus(TourExecutionStatus.COMPLETED);
            execution.setEndTime(LocalDateTime.now());
            System.out.println("Tura " + execution.getTourId() + " je kompletirana od strane " + touristUsername);
        }

        return tourExecutionRepository.save(execution);
    }

    // Helper method to calculate distance between two points using Haversine formula
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radius of Earth in kilometers

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c * 1000; // Convert to meters
    }
}