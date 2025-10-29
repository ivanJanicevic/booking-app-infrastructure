package com.tours.model;

import com.tours.enums.Difficulty;
import com.tours.enums.Prevoz;
import com.tours.enums.TourStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "tours")
public class Tour {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Naziv ture je obavezan")
    @Size(max = 255, message = "Naziv ture ne može biti duži od 255 karaktera")
    @Column(nullable = false)
    private String naziv;
    
    @NotBlank(message = "Opis ture je obavezan")
    @Size(max = 2000, message = "Opis ture ne može biti duži od 2000 karaktera")
    @Column(nullable = false, columnDefinition = "TEXT")
    private String opis;
    
    @Size(max = 500, message = "Tagovi ne mogu biti duži od 500 karaktera")
    @Column(name = "tagovi")
    private String tagovi;
    
    @Enumerated(EnumType.STRING)
    @NotNull(message = "Težina ture je obavezna")
    @Column(nullable = false)
    private Difficulty tezina;
    
    @Enumerated(EnumType.STRING)
    @NotNull(message = "Status ture je obavezan")
    @Column(nullable = false)
    private TourStatus status;
    
    @PositiveOrZero(message = "Cijena ne može biti negativna")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal cijena;
    
    @Column(name = "recenzija_id")
    private Long recenzijaId;

    @Column(name = "autor_username")
    private String autorUsername;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "duzina")
    private Double duzina; // Dužina ture u kilometrima
    
    @Column(name = "vreme_objave")
    private LocalDateTime vremeObjave;
    
    @Column(name = "vreme_arhiviranja")
    private LocalDateTime vremeArhiviranja;
    
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "tour_prevozi", joinColumns = @JoinColumn(name = "tour_id"))
    @MapKeyEnumerated(EnumType.STRING)
    @Column(name = "trajanje_minuti")
    @MapKeyColumn(name = "prevoz")
    private Map<Prevoz, Integer> prevozi = new HashMap<>(); // Map<Prevoz, trajanje u minutima>
    
    public Tour() {
    }
    
    public Tour(String naziv, String opis, String tagovi, Difficulty tezina, String autorUsername) {
        this.naziv = naziv;
        this.opis = opis;
        this.tagovi = tagovi;
        this.tezina = tezina;
        this.status = TourStatus.DRAFT;
        this.cijena = BigDecimal.ZERO;
        this.autorUsername = autorUsername;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getNaziv() {
        return naziv;
    }
    
    public void setNaziv(String naziv) {
        this.naziv = naziv;
    }
    
    public String getOpis() {
        return opis;
    }
    
    public void setOpis(String opis) {
        this.opis = opis;
    }
    
    public String getTagovi() {
        return tagovi;
    }
    
    public void setTagovi(String tagovi) {
        this.tagovi = tagovi;
    }
    
    public Difficulty getTezina() {
        return tezina;
    }
    
    public void setTezina(Difficulty tezina) {
        this.tezina = tezina;
    }
    
    public TourStatus getStatus() {
        return status;
    }
    
    public void setStatus(TourStatus status) {
        this.status = status;
    }
    
    public BigDecimal getCijena() {
        return cijena;
    }
    
    public void setCijena(BigDecimal cijena) {
        this.cijena = cijena;
    }
    
    public Long getRecenzijaId() {
        return recenzijaId;
    }
    
    public void setRecenzijaId(Long recenzijaId) {
        this.recenzijaId = recenzijaId;
    }
    
    public String getAutorUsername() {
        return autorUsername;
    }
    
    public void setAutorUsername(String autorUsername) {
        this.autorUsername = autorUsername;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public Double getDuzina() {
        return duzina;
    }
    
    public void setDuzina(Double duzina) {
        this.duzina = duzina;
    }
    
    public LocalDateTime getVremeObjave() {
        return vremeObjave;
    }
    
    public void setVremeObjave(LocalDateTime vremeObjave) {
        this.vremeObjave = vremeObjave;
    }
    
    public LocalDateTime getVremeArhiviranja() {
        return vremeArhiviranja;
    }
    
    public void setVremeArhiviranja(LocalDateTime vremeArhiviranja) {
        this.vremeArhiviranja = vremeArhiviranja;
    }
    
    public Map<Prevoz, Integer> getPrevozi() {
        return prevozi;
    }
    
    public void setPrevozi(Map<Prevoz, Integer> prevozi) {
        this.prevozi = prevozi;
    }
}
