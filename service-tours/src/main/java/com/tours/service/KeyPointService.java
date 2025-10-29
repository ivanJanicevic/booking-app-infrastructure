package com.tours.service;

import com.tours.enums.Prevoz;
import com.tours.enums.TourStatus;
import com.tours.model.KeyPoint;
import com.tours.model.Tour;
import com.tours.repository.KeyPointRepository;
import com.tours.repository.TourRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
@Transactional
public class KeyPointService {
    
    private final KeyPointRepository keyPointRepository;
    private final TourRepository tourRepository;
    
    @Autowired
    public KeyPointService(KeyPointRepository keyPointRepository, TourRepository tourRepository) {
        this.keyPointRepository = keyPointRepository;
        this.tourRepository = tourRepository;
    }
    
    public KeyPoint createKeyPoint(String naziv, String opis, Double latitude, Double longitude, 
                                  String slikaUrl, Long tourId, String autorUsername) {
        Optional<Tour> tour = tourRepository.findById(tourId);
        if (tour.isEmpty() || !tour.get().getAutorUsername().equals(autorUsername)) {
            throw new IllegalArgumentException("Tura nije pronađena ili ne pripada autoru");
        }
        
        if (tour.get().getStatus() != TourStatus.DRAFT) {
            throw new IllegalArgumentException("Ključna tačka se može dodati samo ako je tura u statusu DRAFT");
        }
        
        KeyPoint keyPoint = new KeyPoint(naziv, opis, latitude, longitude, slikaUrl, tourId);
        KeyPoint savedKeyPoint = keyPointRepository.save(keyPoint);
        
        long keyPointCount = keyPointRepository.countByTourId(tourId);
        if (keyPointCount >= 2) {
            List<KeyPoint> keyPoints = keyPointRepository.findByTourIdAndAuthorUsername(tourId, autorUsername);
            double airDistance = calculateTotalDistance(keyPoints); // Vazduhshna linija
            Tour t = tour.get();
            
            try {
                StringBuilder coordinates = new StringBuilder();
                for (KeyPoint kp : keyPoints) {
                    if (coordinates.length() > 0) coordinates.append(";");
                    coordinates.append(kp.getLongitude()).append(",").append(kp.getLatitude());
                }
                
                double roadDistance = getRoadDistanceFromOSRM(coordinates.toString());
                t.setDuzina(roadDistance); // Koristi dužinu po drumovima
            } catch (Exception e) {
                System.err.println("OSRM neuspeh, koristim vazduhshnu liniju: " + e.getMessage());
                t.setDuzina(airDistance);
            }
            
            if (t.getDuzina() > 0) {
                Map<Prevoz, Integer> prevozi = new HashMap<>();
                int vremePeske = (int) Math.round((t.getDuzina() / 4.0) * 60);    // 4 km/h
                int vremeBicikl = (int) Math.round((t.getDuzina() / 15.0) * 60);  // 15 km/h
                int vremeAuto = (int) Math.round((t.getDuzina() / 30.0) * 60);     // 30 km/h (gradska brzina)
                prevozi.put(Prevoz.PESKE, vremePeske);
                prevozi.put(Prevoz.BICIKL, vremeBicikl);
                prevozi.put(Prevoz.AUTOMOBIL, vremeAuto);
                t.setPrevozi(prevozi);
            }
            
            tourRepository.save(t);
        }
        
        return savedKeyPoint;
    }
    
    private double calculateTotalDistance(List<KeyPoint> keyPoints) {
        if (keyPoints.size() < 2) {
            return 0.0;
        }
        
        double totalDistance = 0.0;
        for (int i = 0; i < keyPoints.size() - 1; i++) {
            KeyPoint current = keyPoints.get(i);
            KeyPoint next = keyPoints.get(i + 1);
            
            double lat1 = Math.toRadians(current.getLatitude());
            double lat2 = Math.toRadians(next.getLatitude());
            double lon1 = Math.toRadians(current.getLongitude());
            double lon2 = Math.toRadians(next.getLongitude());
            
            double dLat = lat2 - lat1;
            double dLon = lon2 - lon1;
            
            double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                       Math.cos(lat1) * Math.cos(lat2) *
                       Math.sin(dLon / 2) * Math.sin(dLon / 2);
            double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            
            double earthRadius = 6371.0; // km
            totalDistance += earthRadius * c;
        }
        
        return totalDistance;
    }
    
    @Transactional(readOnly = true)
    public List<KeyPoint> getAllKeyPointsByTour(Long tourId, String autorUsername) {
        Optional<Tour> tour = tourRepository.findById(tourId);
        if (tour.isEmpty()) {
            throw new IllegalArgumentException("Tura nije pronađena ili ne pripada autoru");
        }
        
        return keyPointRepository.findByTourId(tourId);
    }
    
    @Transactional(readOnly = true)
    public List<KeyPoint> getAllKeyPointsByAuthor(String autorUsername) {
        return keyPointRepository.findByAuthorUsername(autorUsername);
    }
    
    @Transactional(readOnly = true)
    public Optional<KeyPoint> getKeyPointById(Long keyPointId, String autorUsername) {
        return keyPointRepository.findByIdAndAuthorUsername(keyPointId, autorUsername);
    }
    
    public KeyPoint updateKeyPoint(Long keyPointId, String naziv, String opis, Double latitude, 
                                  Double longitude, String slikaUrl, String autorUsername) {
        Optional<KeyPoint> existingKeyPoint = keyPointRepository.findByIdAndAuthorUsername(keyPointId, autorUsername);
        if (existingKeyPoint.isEmpty()) {
            throw new IllegalArgumentException("Ključna tačka nije pronađena");
        }
        
        KeyPoint keyPoint = existingKeyPoint.get();
        
        Optional<Tour> tour = tourRepository.findById(keyPoint.getTourId());
        if (tour.isPresent() && tour.get().getStatus() != TourStatus.DRAFT) {
            throw new IllegalArgumentException("Ključna tačka se može editovati samo ako je tura u statusu DRAFT");
        }
        
        keyPoint.setNaziv(naziv);
        keyPoint.setOpis(opis);
        keyPoint.setLatitude(latitude);
        keyPoint.setLongitude(longitude);
        keyPoint.setSlikaUrl(slikaUrl);
        
        return keyPointRepository.save(keyPoint);
    }
    
    public boolean deleteKeyPoint(Long keyPointId, String autorUsername) {
        Optional<KeyPoint> keyPoint = keyPointRepository.findByIdAndAuthorUsername(keyPointId, autorUsername);
        if (keyPoint.isPresent()) {
            Optional<Tour> tour = tourRepository.findById(keyPoint.get().getTourId());
            if (tour.isPresent() && tour.get().getStatus() != TourStatus.DRAFT) {
                throw new IllegalArgumentException("Ključna tačka se može obrisati samo ako je tura u statusu DRAFT");
            }
            keyPointRepository.delete(keyPoint.get());
            return true;
        }
        return false;
    }
    
    @Transactional(readOnly = true)
    public long countKeyPointsByTour(Long tourId, String autorUsername) {
        Optional<Tour> tour = tourRepository.findById(tourId);
        if (tour.isEmpty() || !tour.get().getAutorUsername().equals(autorUsername)) {
            return 0;
        }
        
        return keyPointRepository.countByTourId(tourId);
    }
    
    @Transactional(readOnly = true)
    public long countKeyPointsByAuthor(String autorUsername) {
        return keyPointRepository.countByAuthorUsername(autorUsername);
    }

    @Transactional(readOnly = true)
    public Optional<KeyPoint> getFirstKeyPointByTourId(Long tourId) {
        return keyPointRepository.findFirstByTourIdOrderByCreatedAtAsc(tourId);
    }

    private double getRoadDistanceFromOSRM(String coordinates) {
        try {
            String url = String.format("https://router.project-osrm.org/route/v1/driving/%s?overview=false&alternatives=false", coordinates);
            
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(5))
                    .build();
            
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(10))
                    .GET()
                    .build();
            
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            
            if (response.statusCode() == 200) {
                ObjectMapper mapper = new ObjectMapper();
                JsonNode jsonNode = mapper.readTree(response.body());
                
                if (jsonNode.has("routes") && jsonNode.get("routes").isArray() && jsonNode.get("routes").size() > 0) {
                    JsonNode route = jsonNode.get("routes").get(0);
                    
                    int distanceInMeters = route.get("distance").asInt();
                    return distanceInMeters / 1000.0;
                }
            }
            
            return 0.0;
            
        } catch (Exception e) {
            System.err.println("Greška pri pozivu OSRM za udaljenost: " + e.getMessage());
            return 0.0;
        }
    }
}

