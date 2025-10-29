import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { KeyPointService } from '../../services/keypoint.service';
import { TourService } from '../../services/tour.service';
import { KeyPoint } from '../../models/keypoint.model';
import { Tour } from '../../models/tour.model';
import * as L from 'leaflet';

@Component({
  selector: 'app-keypoint-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './keypoint-list.component.html',
  styleUrl: './keypoint-list.component.css'
})
export class KeypointListComponent implements OnInit, AfterViewInit, OnDestroy {
  keyPoints: KeyPoint[] = [];
  loading = false;
  error: string | null = null;
  tourId: number | null = null;
  tour: Tour | null = null;
  private map: L.Map | null = null;
  private markers: L.Marker[] = [];

  constructor(
    private keyPointService: KeyPointService,
    private tourService: TourService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.tourId = Number(this.route.snapshot.paramMap.get('tourId'));
    if (this.tourId) {
      this.loadTour();
      this.loadKeyPoints();
    }
  }

  loadTour() {
    if (!this.tourId) return;
    this.tourService.getTourById(this.tourId).subscribe({
      next: (tour) => {
        this.tour = tour;
      },
      error: (error) => {
        console.error('Error loading tour:', error);
      }
    });
  }

  loadKeyPoints() {
    if (!this.tourId) return;

    this.loading = true;
    this.error = null;

    this.keyPointService.getKeyPointsByTour(this.tourId).subscribe({
      next: (keyPoints) => {
        this.keyPoints = keyPoints;
        this.loading = false;
        // Initialize map after data is loaded
        setTimeout(() => {
          this.initMap();
        }, 100);
      },
      error: (error) => {
        this.error = 'Greška pri učitavanju ključnih tačaka: ' + error.message;
        this.loading = false;
        this.keyPoints = [];
      }
    });
  }

  ngAfterViewInit() {
    // Map will be initialized after data is loaded
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  initMap() {
    if (!document.getElementById('keypoint-map') || this.keyPoints.length === 0) {
      return;
    }

    // Calculate center of all keypoints or use Belgrade default
    let centerLat = 0;
    let centerLng = 0;
    
    if (this.keyPoints.length > 0) {
      this.keyPoints.forEach(kp => {
        centerLat += kp.latitude;
        centerLng += kp.longitude;
      });
      centerLat /= this.keyPoints.length;
      centerLng /= this.keyPoints.length;
    } else {
      centerLat = 44.7866;
      centerLng = 20.4489;
    }

    // Initialize map
    this.map = L.map('keypoint-map').setView([centerLat, centerLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Create array of coordinates for the polyline
    const coordinates: [number, number][] = [];
    
    // Add markers for each keypoint and collect coordinates
    this.keyPoints.forEach(keyPoint => {
      const marker = L.marker([keyPoint.latitude, keyPoint.longitude])
        .addTo(this.map!)
        .bindPopup(`<b>${keyPoint.naziv}</b><br>${keyPoint.opis}`);
      
      this.markers.push(marker);
      coordinates.push([keyPoint.latitude, keyPoint.longitude]);
    });

    // Draw routing line following roads using OSRM if there are at least 2 points
    if (coordinates.length >= 2) {
      this.drawRouteWithOSRM(coordinates);
    } else if (this.markers.length > 0) {
      // Fit map to show all markers if no routing
      const group = new L.FeatureGroup(this.markers);
      this.map.fitBounds(group.getBounds().pad(0.1));
    }
  }

  deleteKeyPoint(keyPoint: KeyPoint) {
    if (confirm(`Da li ste sigurni da želite da obrišete ključnu tačku "${keyPoint.naziv}"?`)) {
      this.keyPointService.deleteKeyPoint(keyPoint.id).subscribe({
        next: () => {
          this.keyPoints = this.keyPoints.filter(kp => kp.id !== keyPoint.id);
          // Reinitialize map after deletion
          if (this.map) {
            this.map.remove();
            this.map = null;
          }
          this.markers = [];
          
          setTimeout(() => {
            this.initMap();
          }, 100);
        },
        error: (error) => {
          alert('Greška pri brisanju ključne tačke: ' + error.message);
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/tours']);
  }

  drawRouteWithOSRM(waypoints: [number, number][]) {
    if (waypoints.length < 2) return;

    // OSRM API endpoint
    const osrmUrl = 'https://router.project-osrm.org/route/v1/driving/';
    
    // Build the URL with waypoints
    let url = osrmUrl;
    waypoints.forEach((point, index) => {
      if (index > 0) url += ';';
      url += `${point[1]},${point[0]}`;
    });
    url += '?overview=full&geometries=geojson';

    // Fetch the route
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coordinates = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
          
          // Remove old polyline if exists
          this.map?.eachLayer((layer) => {
            if (layer instanceof L.Polyline) {
              this.map?.removeLayer(layer);
            }
          });

          // Add new route line
          L.polyline(coordinates as [number, number][], {
            color: '#3b82f6',
            weight: 5,
            opacity: 0.8,
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(this.map!);

          // Fit map to show the route
          const bounds = L.latLngBounds(coordinates as [number, number][]);
          this.map?.fitBounds(bounds, { padding: [20, 20] });
        }
      })
      .catch(error => {
        console.error('Error fetching OSRM route:', error);
        // Fallback to simple polyline
        this.map?.addLayer(L.polyline(waypoints, {
          color: '#3b82f6',
          weight: 4,
          opacity: 0.7
        }));
      });
  }

  isDraft(): boolean {
    return this.tour?.status === 'DRAFT';
  }
}
