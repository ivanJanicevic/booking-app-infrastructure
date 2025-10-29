package com.tours.controller;

import com.tours.enums.Difficulty;
import com.tours.enums.TourStatus;
import com.tours.model.Tour;
import com.tours.service.TourService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/tours")
public class TourController {

    private final TourService tourService;
    
    @Autowired
    private HttpServletRequest httpServletRequest;

    @Autowired
    public TourController(TourService tourService) {
        this.tourService = tourService;
    }

    private String getCurrentUsername() {
        String username = httpServletRequest.getHeader("X-Username");
        System.out.println("🔍 getCurrentUsername() - X-Username header: " + username);
        
        if (username != null && !username.isEmpty()) {
            return username;
        }
        
        // Fallback to SecurityContext if running standalone
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("🔍 getCurrentUsername() - Authentication: " + (authentication != null ? authentication.getName() : "null"));
        
        if (authentication != null && authentication.isAuthenticated() &&
                !"anonymousUser".equals(authentication.getPrincipal())) {
            return authentication.getName();
        }
        return null;
    }

    @PostMapping
    public ResponseEntity<?> createTour(@RequestBody Map<String, String> request) {
        try {
            String autorUsername = getCurrentUsername();
            if (autorUsername == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Korisnik nije autentifikovan"));
            }

            String naziv = request.get("naziv");
            String opis = request.get("opis");
            String tagovi = request.get("tagovi");
            String tezina = request.get("tezina");

            Difficulty difficulty = Difficulty.valueOf(tezina.toUpperCase());
            Tour tour = tourService.createTour(naziv, opis, tagovi, difficulty, autorUsername);
            return ResponseEntity.status(HttpStatus.CREATED).body(tour);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Greška pri kreiranju ture: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllToursByAuthor(@RequestHeader(value = "X-User-Role", required = false) String role) {
        try {
            String autorUsername = getCurrentUsername();
            System.out.println("🔍 TourController - getAllToursByAuthor - autorUsername: " + autorUsername + ", role: " + role);
            
            if (autorUsername == null || autorUsername.isEmpty()) {
                System.err.println("⚠️ Username je NULL ili prazan!");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Korisnik nije autentifikovan - username nedostaje"));
            }

            if ("ROLE_TOURIST".equals(role)) {
                List<Tour> tours = tourService.getAllPublishedTours();
                System.out.println("✅ Turista vidi: " + tours.size() + " objavljenih tura");
                return ResponseEntity.ok(tours);
            }

            List<Tour> tours = tourService.getAllToursByAuthor(autorUsername);
            System.out.println("✅ Autor vidi: " + tours.size() + " svojih tura");
            return ResponseEntity.ok(tours);
        } catch (Exception e) {
            System.err.println("❌ ERROR u getAllToursByAuthor: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Greška na serveru: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTourById(@PathVariable Long id) {
        String autorUsername = getCurrentUsername();
        if (autorUsername == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Korisnik nije autentifikovan"));
        }

        Optional<Tour> tour = tourService.getTourByIdAndAuthor(id, autorUsername);
        if (tour.isPresent()) {
            return ResponseEntity.ok(tour.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Tura nije pronađena"));
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<?> getToursByStatus(@PathVariable String status) {
        String autorUsername = getCurrentUsername();
        if (autorUsername == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Korisnik nije autentifikovan"));
        }

        try {
            TourStatus tourStatus = TourStatus.valueOf(status.toUpperCase());
            
            // Za PUBLISHED ture, vraćamo SVE objavljene ture (za turiste)
            if (tourStatus == TourStatus.PUBLISHED) {
                List<Tour> tours = tourService.getAllPublishedTours();
                return ResponseEntity.ok(tours);
            }
            
            // Za DRAFT i ARCHIVED, vraćamo samo ture trenutnog korisnika
            List<Tour> tours = tourService.getToursByStatusAndAuthor(tourStatus, autorUsername);
            return ResponseEntity.ok(tours);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Neispravan status ture"));
        }
    }

    @GetMapping("/difficulty/{difficulty}")
    public ResponseEntity<?> getToursByDifficulty(@PathVariable String difficulty) {
        String autorUsername = getCurrentUsername();
        if (autorUsername == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Korisnik nije autentifikovan"));
        }

        try {
            Difficulty diff = Difficulty.valueOf(difficulty.toUpperCase());
            List<Tour> tours = tourService.getToursByDifficultyAndAuthor(diff, autorUsername);
            return ResponseEntity.ok(tours);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Neispravna težina ture"));
        }
    }

    @GetMapping("/tag/{tag}")
    public ResponseEntity<List<Tour>> getToursByTag(@PathVariable String tag) {
        String autorUsername = getCurrentUsername();
        if (autorUsername == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<Tour> tours = tourService.getToursByTagAndAuthor(tag, autorUsername);
        return ResponseEntity.ok(tours);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTour(@PathVariable Long id,
                                        @RequestParam String naziv,
                                        @RequestParam String opis,
                                        @RequestParam String tagovi,
                                        @RequestParam String tezina) {
        String autorUsername = getCurrentUsername();
        if (autorUsername == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Korisnik nije autentifikovan"));
        }

        Optional<Tour> existingTour = tourService.getTourByIdAndAuthor(id, autorUsername);
        if (existingTour.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Tura nije pronađena"));
        }

        try {
            Difficulty difficulty = Difficulty.valueOf(tezina.toUpperCase());
            Tour tour = existingTour.get();
            tour.setNaziv(naziv);
            tour.setOpis(opis);
            tour.setTagovi(tagovi);
            tour.setTezina(difficulty);

            Tour updatedTour = tourService.updateTour(tour);
            return ResponseEntity.ok(updatedTour);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Greška pri ažuriranju ture: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTour(@PathVariable Long id) {
        String autorUsername = getCurrentUsername();
        if (autorUsername == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Korisnik nije autentifikovan"));
        }

        boolean deleted = tourService.deleteTour(id, autorUsername);
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "Tura je uspešno obrisana"));
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Tura nije pronađena"));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getTourStats() {
        String autorUsername = getCurrentUsername();
        if (autorUsername == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Korisnik nije autentifikovan"));
        }

        long totalTours = tourService.countToursByAuthor(autorUsername);
        long draftTours = tourService.countToursByStatusAndAuthor(TourStatus.DRAFT, autorUsername);
        long publishedTours = tourService.countToursByStatusAndAuthor(TourStatus.PUBLISHED, autorUsername);
        long archivedTours = tourService.countToursByStatusAndAuthor(TourStatus.ARCHIVED, autorUsername);

        Map<String, Object> stats = Map.of(
                "totalTours", totalTours,
                "draftTours", draftTours,
                "publishedTours", publishedTours,
                "archivedTours", archivedTours
        );

        return ResponseEntity.ok(stats);
    }

    @PutMapping("/{id}/publish")
    public ResponseEntity<?> publishTour(@PathVariable Long id) {
        String autorUsername = getCurrentUsername();
        if (autorUsername == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Korisnik nije autentifikovan"));
        }

        try {
            Tour tour = tourService.publishTour(id, autorUsername);
            return ResponseEntity.ok(tour);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/archive")
    public ResponseEntity<?> archiveTour(@PathVariable Long id) {
        String autorUsername = getCurrentUsername();
        if (autorUsername == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Korisnik nije autentifikovan"));
        }

        try {
            Tour tour = tourService.archiveTour(id, autorUsername);
            return ResponseEntity.ok(tour);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<?> activateTour(@PathVariable Long id) {
        String autorUsername = getCurrentUsername();
        if (autorUsername == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Korisnik nije autentifikovan"));
        }

        try {
            Tour tour = tourService.activateTour(id, autorUsername);
            return ResponseEntity.ok(tour);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}