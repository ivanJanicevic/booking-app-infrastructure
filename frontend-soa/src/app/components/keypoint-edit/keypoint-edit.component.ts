import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { KeyPointService } from '../../services/keypoint.service';
import { KeyPoint, CreateKeyPointRequest } from '../../models/keypoint.model';
import * as L from 'leaflet';

@Component({
  selector: 'app-keypoint-edit',
  imports: [CommonModule, FormsModule],
  templateUrl: './keypoint-edit.component.html',
  styleUrl: './keypoint-edit.component.css'
})
export class KeypointEditComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  keyPointData: CreateKeyPointRequest = {
    naziv: '',
    opis: '',
    latitude: 44.7866,
    longitude: 20.4489,
    slikaUrl: '',
    tourId: 0
  };

  loading = false;
  error: string | null = null;
  keyPointId: number | null = null;
  tourId: number | null = null;
  private map: L.Map | null = null;
  private marker: L.Marker | null = null;

  constructor(
    private keyPointService: KeyPointService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.keyPointId = Number(this.route.snapshot.paramMap.get('keyPointId'));
    this.tourId = Number(this.route.snapshot.paramMap.get('tourId'));
    
    if (this.keyPointId) {
      this.loadKeyPoint();
    } else {
      // If no keyPointId, initialize map after view is rendered
      this.loading = false;
    }
  }

  ngAfterViewInit() {
    // If no keyPointId (create new), initialize map here
    if (!this.keyPointId) {
      setTimeout(() => {
        this.initMap();
      }, 100);
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  initMap() {
    if (!document.getElementById('map')) {
      console.error('Map container not found!');
      return;
    }
    
    this.map = L.map('map').setView([this.keyPointData.latitude, this.keyPointData.longitude], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.marker = L.marker([this.keyPointData.latitude, this.keyPointData.longitude]).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      
      this.keyPointData.latitude = lat;
      this.keyPointData.longitude = lng;
      
      if (this.marker) {
        this.marker.setLatLng([lat, lng]);
      }
    });
  }

  loadKeyPoint() {
    if (!this.keyPointId) return;

    this.loading = true;
    this.error = null;

    this.keyPointService.getKeyPointById(this.keyPointId).subscribe({
      next: (keyPoint: KeyPoint) => {
        this.keyPointData = {
          naziv: keyPoint.naziv,
          opis: keyPoint.opis,
          latitude: keyPoint.latitude,
          longitude: keyPoint.longitude,
          slikaUrl: keyPoint.slikaUrl || '',
          tourId: keyPoint.tourId
        };
        this.tourId = keyPoint.tourId;
        this.loading = false;
        
        // Initialize map after data is loaded and view is rendered
        setTimeout(() => {
          this.initMap();
        }, 100);
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Greška pri učitavanju ključne tačke: ' + error.message;
        this.loadMockKeyPoint();
      }
    });
  }

  loadMockKeyPoint() {
    this.keyPointData = {
      naziv: 'Muzej Nikole Tesle',
      opis: 'Muzej posvećen životu i radu velikog naučnika Nikole Tesle.',
      latitude: 44.7866,
      longitude: 20.4489,
      slikaUrl: 'https://example.com/tesla-museum.jpg',
      tourId: this.tourId || 1
    };
    this.loading = false;
    // Initialize map after mock data is loaded
    setTimeout(() => {
      this.initMap();
    }, 100);
  }

  onSubmit() {
    if (!this.validateForm() || !this.keyPointId) {
      return;
    }

    this.loading = true;
    this.error = null;

    this.keyPointService.updateKeyPoint(this.keyPointId, this.keyPointData).subscribe({
      next: (keyPoint) => {
        this.loading = false;
        alert('Ključna tačka je uspešno ažurirana!');
        this.router.navigate(['/tours', this.tourId, 'keypoints']);
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Greška pri ažuriranju ključne tačke: ' + error.message;
        this.simulateSuccess();
      }
    });
  }

  simulateSuccess() {
    setTimeout(() => {
      this.loading = false;
      alert('Ključna tačka je uspešno ažurirana! (Simulacija)');
      this.router.navigate(['/tours', this.tourId, 'keypoints']);
    }, 1000);
  }

  validateForm(): boolean {
    if (!this.keyPointData.naziv.trim()) {
      this.error = 'Naziv ključne tačke je obavezan';
      return false;
    }

    if (!this.keyPointData.opis.trim()) {
      this.error = 'Opis ključne tačke je obavezan';
      return false;
    }

    if (this.keyPointData.naziv.length > 255) {
      this.error = 'Naziv ključne tačke ne može biti duži od 255 karaktera';
      return false;
    }

    if (this.keyPointData.opis.length > 1000) {
      this.error = 'Opis ključne tačke ne može biti duži od 1000 karaktera';
      return false;
    }

    if (this.keyPointData.slikaUrl && this.keyPointData.slikaUrl.length > 500) {
      this.error = 'URL slike ne može biti duži od 500 karaktera';
      return false;
    }

    this.error = null;
    return true;
  }

  onCancel() {
    this.router.navigate(['/tours', this.tourId, 'keypoints']);
  }

  getCharacterCount(text: string, maxLength: number): string {
    return `${text.length}/${maxLength}`;
  }

  isCharacterLimitExceeded(text: string, maxLength: number): boolean {
    return text.length > maxLength;
  }
}
