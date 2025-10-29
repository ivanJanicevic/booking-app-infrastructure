// src/app/components/simulator/simulator.component.ts
import { AfterViewInit, Component, OnInit, OnDestroy } from '@angular/core'; // Dodaj OnDestroy
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';

import { icon, Marker } from 'leaflet';
import { TouristLocationService } from '../../services/tourist-location';
import { AuthService } from '../../services/auth/auth';

const iconRetinaUrl = 'assets/leaflet/marker-icon-2x.png';
const iconUrl = 'assets/leaflet/marker-icon.png';
const shadowUrl = 'assets/leaflet/marker-shadow.png';
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
  selector: 'app-simulator',
  templateUrl: './simulator.html',
  styleUrls: ['./simulator.css'],
  standalone: true,
  imports: [CommonModule]
})
export class Simulator implements OnInit, AfterViewInit, OnDestroy { // Implementiraj OnDestroy
  private map: any;
  username: string = "";
  currentLocation: any | null = null;
  marker: L.Marker | null = null;

  constructor(private touristLocationService: TouristLocationService, private authService : AuthService) { }

  ngOnInit(): void {
    this.username = this.authService.getUsername() || "";
    this.loadCurrentLocation();
  }

  ngAfterViewInit(): void {
    // Daj malo vremena da se dialog renderuje pre inicijalizacije mape
    setTimeout(() => {
        if (!this.map) { // Proveri da li mapa nije već inicijalizovana
            this.initMap();
        }
        // Obavezno invalidateSize() kada je komponenta sigurno vidljiva
        // (posebno važno kada se koristi unutar dialoga)
        if (this.map) {
            this.map.invalidateSize();
            console.log("Simulator mapa: invalidateSize pozvan u ngAfterViewInit.");
        }
    }, 100); // 100ms kašnjenja
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove(); // Ukloni mapu iz DOM-a kada se komponenta uništi
      this.map = null;
    }
  }

  private initMap(): void {
    const mapElement = document.getElementById('map');
    if (!mapElement) {
      console.error('Simulator mapa: Element sa ID "map" nije pronađen.');
      return;
    }

    this.map = L.map('map').setView([44.7866, 20.4489], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.onMapClick(e.latlng.lat, e.latlng.lng);
    });

    if (this.currentLocation) {
      this.addOrUpdateMarker(this.currentLocation.latitude, this.currentLocation.longitude);
      this.map.setView([this.currentLocation.latitude, this.currentLocation.longitude], 15);
    }
  }

  loadCurrentLocation(): void {
    this.touristLocationService.getCurrentLocation(this.username).subscribe({
      next: (location) => {
        this.currentLocation = location;
        console.log('Učitana trenutna lokacija:', location);
        if (this.map) {
          this.addOrUpdateMarker(location.latitude, location.longitude);
          this.map.setView([location.latitude, location.longitude], 15);
          this.map.invalidateSize(); // Dodatno osvežavanje nakon učitavanja lokacije i ako se mapa osvežava
        }
      },
      error: (err) => {
        console.error('Nema prethodno sačuvane lokacije ili greška:', err);
        this.currentLocation = null;
      }
    });
  }

  onMapClick(lat: number, lng: number): void {
    console.log(`Kliknuto na mapu: Lat ${lat}, Lng ${lng} Id:${this.username}`);
    this.updateTouristLocation(lat, lng);
  }

  updateTouristLocation(lat: number, lng: number): void {
    const locationData = {
      username: this.username,
      latitude: lat,
      longitude: lng
    };

    this.touristLocationService.updateLocation(locationData).subscribe({
      next: (response) => {
        this.currentLocation = response;
        this.addOrUpdateMarker(response.latitude, response.longitude);
        console.log('Lokacija uspešno ažurirana:', response);
      },
      error: (err) => {
        console.error('Greška pri ažuriranju lokacije:', err);
      }
    });
  }

  addOrUpdateMarker(lat: number, lng: number): void {
    if (this.map) {
        if (this.marker) {
            this.marker.setLatLng([lat, lng]);
        } else {
            this.marker = L.marker([lat, lng]).addTo(this.map)
            .bindPopup('Trenutna pozicija')
            .openPopup();
        }
        this.map.setView([lat, lng], this.map.getZoom());
    }
  }
}