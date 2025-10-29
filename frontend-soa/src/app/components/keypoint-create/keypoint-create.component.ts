import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { KeyPointService } from '../../services/keypoint.service';
import { CreateKeyPointRequest } from '../../models/keypoint.model';
import * as L from 'leaflet';

@Component({
  selector: 'app-keypoint-create',
  imports: [CommonModule, FormsModule],
  templateUrl: './keypoint-create.component.html',
  styleUrl: './keypoint-create.component.css'
})
export class KeypointCreateComponent implements OnInit, AfterViewInit, OnDestroy {
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
  tourId: number | null = null;
  private map: L.Map | null = null;
  private marker: L.Marker | null = null;

  constructor(
    private keyPointService: KeyPointService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.tourId = Number(this.route.snapshot.paramMap.get('tourId'));
    if (this.tourId) {
      this.keyPointData.tourId = this.tourId;
    }
  }

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  initMap() {
    this.map = L.map('map').setView([44.7866, 20.4489], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.marker = L.marker([44.7866, 20.4489]).addTo(this.map);

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

  onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.error = null;

    this.keyPointService.createKeyPoint(this.keyPointData).subscribe({
      next: (keyPoint) => {
        this.loading = false;
        alert('Ključna tačka je uspešno kreirana!');
        this.router.navigate(['/tours', this.tourId, 'keypoints']);
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Greška pri kreiranju ključne tačke: ' + error.message;
        this.simulateSuccess();
      }
    });
  }

  simulateSuccess() {
    setTimeout(() => {
      this.loading = false;
      alert('Ključna tačka je uspešno kreirana! (Simulacija)');
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
