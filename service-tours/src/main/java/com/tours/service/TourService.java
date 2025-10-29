package com.tours.service;

import com.tours.enums.Difficulty;
import com.tours.enums.Prevoz;
import com.tours.enums.TourStatus;
import com.tours.grpc.StakeholdersGrpcClient;
import com.tours.model.Tour;
import com.tours.repository.KeyPointRepository;
import com.tours.repository.TourRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class TourService {

    private final TourRepository tourRepository;
    private final KeyPointRepository keyPointRepository;
    private final StakeholdersGrpcClient stakeholdersGrpcClient;

    @Autowired
    public TourService(
        TourRepository tourRepository, 
        KeyPointRepository keyPointRepository,
        StakeholdersGrpcClient stakeholdersGrpcClient
    ) {
        this.tourRepository = tourRepository;
        this.keyPointRepository = keyPointRepository;
        this.stakeholdersGrpcClient = stakeholdersGrpcClient;
    }

    public Tour createTour(String naziv, String opis, String tagovi, Difficulty tezina, String autorUsername) {
        boolean userExists = stakeholdersGrpcClient.checkUserExists(autorUsername);
        
        if (!userExists) {
            throw new IllegalArgumentException("Korisnik ne postoji: " + autorUsername);
        }
        
        boolean isBlocked = stakeholdersGrpcClient.isUserBlocked(autorUsername);
        
        if (isBlocked) {
            throw new IllegalArgumentException("Korisnik je blokiran: " + autorUsername);
        }
        
        Tour tour = new Tour(naziv, opis, tagovi, tezina, autorUsername);
        Tour savedTour = tourRepository.save(tour);
        
        return savedTour;
    }

    @Transactional(readOnly = true)
    public List<Tour> getAllToursByAuthor(String autorUsername) {
        return tourRepository.findByAutorUsername(autorUsername);
    }

    @Transactional(readOnly = true)
    public Optional<Tour> getTourByIdAndAuthor(Long tourId, String autorUsername) {
        return tourRepository.findById(tourId)
                .filter(tour -> tour.getAutorUsername().equals(autorUsername));
    }

    @Transactional(readOnly = true)
    public List<Tour> getToursByStatusAndAuthor(TourStatus status, String autorUsername) {
        return tourRepository.findByAutorUsernameAndStatus(autorUsername, status.name());
    }

    @Transactional(readOnly = true)
    public List<Tour> getToursByDifficultyAndAuthor(Difficulty difficulty, String autorUsername) {
        return tourRepository.findByAutorUsernameAndTezina(autorUsername, difficulty.name());
    }

    @Transactional(readOnly = true)
    public List<Tour> getToursByTagAndAuthor(String tag, String autorUsername) {
        return tourRepository.findByTagAndAutorUsername(tag, autorUsername);
    }

    public Tour updateTour(Tour tour) {
        if (tour.getStatus() != TourStatus.DRAFT) {
            throw new IllegalArgumentException("Tura se može editovati samo ako je u statusu DRAFT");
        }
        return tourRepository.save(tour);
    }

    public boolean deleteTour(Long tourId, String autorUsername) {
        Optional<Tour> tour = getTourByIdAndAuthor(tourId, autorUsername);
        if (tour.isPresent()) {
            tourRepository.delete(tour.get());
            return true;
        }
        return false;
    }

    @Transactional(readOnly = true)
    public long countToursByAuthor(String autorUsername) {
        return tourRepository.countByAutorUsername(autorUsername);
    }

    @Transactional(readOnly = true)
    public long countToursByStatusAndAuthor(TourStatus status, String autorUsername) {
        return tourRepository.countByAutorUsernameAndStatus(autorUsername, status.name());
    }

    @Transactional(readOnly = true)
    public List<Tour> getAllPublishedTours() {
        return tourRepository.findByStatus(TourStatus.PUBLISHED);
    }

    public Tour publishTour(Long tourId, String autorUsername) {
        Optional<Tour> optionalTour = getTourByIdAndAuthor(tourId, autorUsername);
        if (optionalTour.isEmpty()) {
            throw new RuntimeException("Tura nije pronađena");
        }

        Tour tour = optionalTour.get();

        if (tour.getStatus() != TourStatus.DRAFT && tour.getStatus() != TourStatus.ARCHIVED) {
            throw new IllegalArgumentException("Tura već je objavljena");
        }

        if (tour.getNaziv() == null || tour.getNaziv().trim().isEmpty()) {
            throw new IllegalArgumentException("Tura mora imati naziv");
        }
        if (tour.getOpis() == null || tour.getOpis().trim().isEmpty()) {
            throw new IllegalArgumentException("Tura mora imati opis");
        }
        if (tour.getTezina() == null) {
            throw new IllegalArgumentException("Tura mora imati težinu");
        }
        if (tour.getTagovi() == null || tour.getTagovi().trim().isEmpty()) {
            throw new IllegalArgumentException("Tura mora imati tagove");
        }

        long keyPointCount = keyPointRepository.countByTourId(tourId);
        if (keyPointCount < 2) {
            throw new IllegalArgumentException("Tura mora imati najmanje 2 ključne tačke pre objave");
        }

        Map<Prevoz, Integer> prevozi = tour.getPrevozi();
        
        if (prevozi == null || prevozi.isEmpty()) {
            prevozi = new HashMap<>();
            prevozi.put(Prevoz.PESKE, 0);
            prevozi.put(Prevoz.BICIKL, 0);
            prevozi.put(Prevoz.AUTOMOBIL, 0);
        }

        tour.setPrevozi(prevozi);
        tour.setStatus(TourStatus.PUBLISHED);
        tour.setVremeObjave(LocalDateTime.now());

        return tourRepository.save(tour);
    }

    public Tour archiveTour(Long tourId, String autorUsername) {
        Optional<Tour> optionalTour = getTourByIdAndAuthor(tourId, autorUsername);
        if (optionalTour.isEmpty()) {
            throw new RuntimeException("Tura nije pronađena");
        }

        Tour tour = optionalTour.get();

        if (tour.getStatus() != TourStatus.PUBLISHED) {
            throw new IllegalArgumentException("Samo objavljene ture mogu biti arhivirane");
        }

        tour.setStatus(TourStatus.ARCHIVED);
        tour.setVremeArhiviranja(LocalDateTime.now());

        return tourRepository.save(tour);
    }

    public Tour activateTour(Long tourId, String autorUsername) {
        Optional<Tour> optionalTour = getTourByIdAndAuthor(tourId, autorUsername);
        if (optionalTour.isEmpty()) {
            throw new RuntimeException("Tura nije pronađena");
        }

        Tour tour = optionalTour.get();

        if (tour.getStatus() != TourStatus.ARCHIVED) {
            throw new IllegalArgumentException("Samo arhivirane ture mogu biti aktivirane");
        }

        tour.setStatus(TourStatus.PUBLISHED);
        tour.setVremeArhiviranja(null);

        return tourRepository.save(tour);
    }

    public Tour updateTourDistance(Long tourId, Double duzina) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new RuntimeException("Tura nije pronađena"));

        tour.setDuzina(duzina);
        return tourRepository.save(tour);
    }


}