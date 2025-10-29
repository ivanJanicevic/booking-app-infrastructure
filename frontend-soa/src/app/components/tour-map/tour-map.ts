import { Component, OnInit, OnChanges, SimpleChanges, Input, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { KeyPoint } from '../../models/keypoint.model';
import { icon, Marker } from 'leaflet';

// Dodaci za Leaflet ikone
const iconRetinaUrl = '/assets/leaflet/marker-icon-2x.png';
const iconUrl = '/assets/leaflet/marker-icon.png';
const shadowUrl = '/assets/leaflet/marker-shadow.png';
const touristLocationIconUrl = '/assets/leaflet/location.png';
const defaultIcon = icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
Marker.prototype.options.icon = defaultIcon;

@Component({
  selector: 'app-tour-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tour-map.html',
  styleUrls: ['./tour-map.css']
})
export class TourMapComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() keyPoints: KeyPoint[] = [];
  @Input() currentLatitude: number = 44.7866; // Default Beograd
  @Input() currentLongitude: number = 20.4489; // Default Beograd
  @Input() completedKeyPointIds: number[] = [];

  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  private map: L.Map | null = null;
  private touristMarker: L.Marker | null = null;
  private keyPointMarkers: L.Marker[] = [];

  constructor() { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    if (this.mapContainer && this.mapContainer.nativeElement) {
      this.initMap();
    } else {
      console.error('Map container element not found for TourMapComponent.');
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Samo ako je mapa već inicijalizovana, reaguj na promene
    if (this.map) {
      if (changes['keyPoints'] || changes['completedKeyPointIds']) {
        this.addKeyPointMarkers();
      }
      if (changes['currentLatitude'] || changes['currentLongitude']) {
        this.updateTouristMarker(this.currentLatitude, this.currentLongitude);
      }
      // Osveži veličinu mape uvek kada se nešto promeni, za svaki slučaj
      setTimeout(() => this.map?.invalidateSize(), 100);
    } else if (this.mapContainer && this.mapContainer.nativeElement && (changes['keyPoints'] || changes['currentLatitude'])) {
        // Ako mapa još nije inicijalizovana, a stigli su podaci, probaj da je inicijalizuješ
        // Ovo je važno ako podaci stignu pre ngAfterViewInit
        this.initMap();
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
      console.log('TourMapComponent mapa uništena.');
    }
  }

  private initMap(): void {
    if (this.map) {
      this.map.remove();
    }

    const mapDiv = this.mapContainer.nativeElement;
    if (mapDiv.offsetHeight === 0 || mapDiv.offsetWidth === 0) {
        console.warn('initMap (TourMapComponent): mapContainer ima nulte dimenzije, inicijalizujem ali je potrebno invalidateSize.');
    }

    // Inicijalizacija mape
    this.map = L.map(this.mapContainer.nativeElement).setView([this.currentLatitude, this.currentLongitude], 13);
    console.log('TourMapComponent mapa inicijalizovana na elementu:', this.mapContainer.nativeElement.id);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.addKeyPointMarkers();
    this.updateTouristMarker(this.currentLatitude, this.currentLongitude);

    // KLJUČNO: Invalidate size nakon inicijalizacije, sa kašnjenjem
    setTimeout(() => {
        if (this.map) {
            this.map.invalidateSize();
            console.log("TourMapComponent mapa: invalidateSize pozvan nakon init.");
        }
    }, 100);
  }

  private addKeyPointMarkers(): void {
    if (!this.map) return; // Proveri da li mapa postoji

    this.keyPointMarkers.forEach(marker => marker.remove());
    this.keyPointMarkers = [];

    this.keyPoints.forEach(kp => {
      const color = this.completedKeyPointIds.includes(kp.id) ? 'green' : 'red';
      const keyPointIcon = L.divIcon({
        iconUrl: touristLocationIconUrl,
        iconSize: [30, 42],
        iconAnchor: [15, 42]
      });

      const marker = L.marker([kp.latitude, kp.longitude], { icon: defaultIcon })
        .addTo(this.map as L.Map) // Eksplicitno kastovanje na L.Map
        .bindPopup(`<b>${kp.naziv}</b><br>${kp.opis}`);
      this.keyPointMarkers.push(marker);
    });
    this.fitMapToBounds();
  }

  private updateTouristMarker(lat: number, lng: number): void {
    if (!this.map) return;
    const newTouristIcon = L.icon({
          iconUrl: touristLocationIconUrl,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        });
      if (this.touristMarker) {
        this.touristMarker.setLatLng([lat, lng]);
        this.touristMarker.remove();
        this.touristMarker = L.marker([lat, lng], { icon: newTouristIcon }).addTo(this.map as L.Map)
          .bindPopup('Vaša trenutna pozicija');
      } else {
        

        console.log("EE", `RADI: lat:${lat}, long: ${lng}`);
        this.touristMarker = L.marker([lat, lng], { icon: newTouristIcon }).addTo(this.map as L.Map)
          .bindPopup('Vaša trenutna pozicija');
      }
      this.map.setView([lat, lng], this.map.getZoom());
    }

  private fitMapToBounds(): void {
    if (!this.map) return;

    let markers: L.Marker[] = [];
    if (this.touristMarker) {
        markers.push(this.touristMarker);
    }
    markers = markers.concat(this.keyPointMarkers);

    if (markers.length > 0) {
        // Rešenje za grešku tipa: Kastujemo konstruktor L.featureGroup na 'any'
        const group = new (L.featureGroup as any)(markers);
        this.map.fitBounds(group.getBounds().pad(0.5));
    } else if (this.touristMarker) {
        // Ako nema ključnih tačaka, ali ima turiste, centriraj na turisti
        this.map.setView(this.touristMarker.getLatLng(), 13);
    }
  }
}