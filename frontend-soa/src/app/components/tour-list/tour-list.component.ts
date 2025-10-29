// src/app/components/tour-list/tour-list.component.ts (AŽURIRANO)
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TourService } from '../../services/tour.service';
import { Tour, Difficulty, TourStatus } from '../../models/tour.model';
import { TourExecutionService } from '../../services/tour-execution.service'; // NOVO
import { Subscription, interval } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs'; // Dodaj of za catchError
import { ReviewFormComponent } from '../../pages/review-form/review-form';
import { TourExecution, TourExecutionStatus } from '../../models/tour-execution.model';
import { TouristLocationService } from '../../services/tourist-location';
import { AuthService } from '../../services/auth/auth';
import { KeyPointService } from '../../services/keypoint.service';
import { KeyPoint } from '../../models/keypoint.model';

@Component({
  selector: 'app-tour-list',
  standalone: true,
  templateUrl: './tour-list.component.html',
  styleUrls: ['./tour-list.component.css'],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReviewFormComponent
  ],
})
export class TourListComponent implements OnInit, OnDestroy {
  tours: Tour[] = [];
  loading = false;
  error: string | null = null;
  selectedTag = '';
  isTourist: boolean = false;
  firstKeyPointsMap: Map<number, KeyPoint> = new Map(); // Store first keypoint for each tour

  showReviewForm = false;
  selectedTourIdForReview: number | null = null;

  // Expose Object to template for Object.keys()
  Object = Object;

  // NOVO: Za praćenje aktivne ture
  activeTourExecution: TourExecution | null = null;
  private tourExecutionSubscription: Subscription | null = null;
  private locationUpdateInterval: Subscription | null = null;
  TourExecutionStatus: any;

  constructor(
    private tourService: TourService,
    private tourExecutionService: TourExecutionService, // Ubaci TourExecutionService
    private positionSimulatorService: TouristLocationService, // Ubaci PositionSimulatorService
    private router: Router, // Ubaci Router za navigaciju
    private authService: AuthService,
    private keyPointService: KeyPointService,
  ) { }

  ngOnInit() {
    // Check if user is a tourist
    const role = this.authService.getRole();
    this.isTourist = role === 'ROLE_TOURIST';

    this.loadTours();
    this.checkActiveTourExecution(); // Proveri da li već postoji aktivna tura prilikom inicijalizacije
  }

  ngOnDestroy(): void {
    if (this.tourExecutionSubscription) {
      this.tourExecutionSubscription.unsubscribe();
    }
    if (this.locationUpdateInterval) {
      this.locationUpdateInterval.unsubscribe();
    }
  }

  loadTours() {
    this.loading = true;
    this.error = null;

    // Backend će automatski razlikovati turistu od vodiča kroz X-User-Role header
    this.tourService.getAllToursByAuthor().subscribe({
      next: (tours) => {
        this.tours = tours;
        
        // Za turiste, učita prve keypoint za sve ture
        if (this.isTourist) {
          this.loadFirstKeyPoints();
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('ERROR DETAILS:', error);
        this.error = 'Greška pri učitavanju tura: ' + (error.error?.message || error.message || 'Nepoznata greška');
        this.loading = false;
        this.tours = [];
      }
    });
  }

  loadFirstKeyPoints() {
    const promises = this.tours.map(tour => 
      this.keyPointService.getFirstKeyPointByTour(tour.id).toPromise()
        .then(keyPoint => {
          if (keyPoint) {
            this.firstKeyPointsMap.set(tour.id, keyPoint);
          }
        })
        .catch(() => {
          // Ignore if first keypoint not found
        })
    );

    Promise.all(promises).then(() => {
      this.loading = false;
    });
  }

  filterByTag() {
    if (this.selectedTag.trim()) {
      this.loading = true;
      this.error = null;

      this.tourService.getToursByTag(this.selectedTag.trim()).subscribe({
        next: (tours) => {
          this.tours = tours;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Greška pri pretraživanju po tagu: ' + error.message;
          this.loading = false;
          this.tours = [];
        }
      });
    } else {
      this.loadTours();
    }
  }

  deleteTour(tour: Tour) {
    if (confirm(`Da li ste sigurni da želite da obrišete turu "${tour.naziv}"?`)) {
      this.tourService.deleteTour(tour.id).subscribe({
        next: () => {
          this.tours = this.tours.filter(t => t.id !== tour.id);
        },
        error: (error) => {
          alert('Greška pri brisanju ture: ' + error.message);
        }
      });
    }
  }

  // **** NOVO: Funkcije za pokretanje ture ****
  startTour(tourId: number): void {
    if (this.activeTourExecution && this.activeTourExecution.status === TourExecutionStatus.STARTED) {
      alert('Već imate aktivnu turu. Završite je pre nego što pokrenete novu.');
      // Opciono, preusmeri na aktivnu turu
      this.router.navigate(['/tour-execution', this.activeTourExecution.id]);
      return;
    }

    this.positionSimulatorService.getCurrentLocation(this.authService.getUsername() || "").pipe(
      switchMap(position => {
        if (!position || position.latitude === undefined || position.longitude === undefined) {
          throw new Error('Nije moguće dobiti trenutnu lokaciju. Proverite dozvole.');
        }
        console.log('Počinjem turu sa lokacijom:', position.latitude, position.longitude);
        return this.tourExecutionService.startTour(tourId, position.latitude, position.longitude);
      }),
      tap(execution => {
        this.activeTourExecution = execution;
        alert(`Tura "${tourId}" je uspešno pokrenuta!`);
        this.router.navigate(['/tour-execution', execution.id]); // Preusmeri na komponentu za praćenje ture
      }),
      catchError(err => {
        this.error = `Greška pri pokretanju ture: ${err.error?.error || err.message}`;
        console.error('Greška pri pokretanju ture:', err);
        alert(this.error);
        return of(null); // Vrati Observable sa null da bi stream mogao da se nastavi
      })
    ).subscribe();
  }

  // Proverava da li postoji aktivna tura kada se komponenta inicijalizuje
  checkActiveTourExecution(): void {
    this.tourExecutionService.getActiveTourExecution().pipe(
      tap(execution => {
        this.activeTourExecution = execution;
        if (execution && execution.status === TourExecutionStatus.STARTED) {
          console.log('Postoji aktivna tura:', execution.id);
          // Opciono: preusmeriti korisnika direktno na aktivnu turu ako je želi nastaviti
          // this.router.navigate(['/tour-execution', execution.id]);
        }
      }),
      catchError(err => {
        if (err.status === 404) { // Nema aktivnih tura
          console.log('Nema aktivnih tura za ovog korisnika.');
          this.activeTourExecution = null;
        } else {
          this.error = `Greška pri proveri aktivne ture: ${err.error?.error || err.message}`;
          console.error('Greška pri proveri aktivne ture:', err);
        }
        return of(null);
      })
    ).subscribe();
  }
  // **** KRAJ NOVIH FUNKCIJA ZA POKRETANJE TURE ****

  // **** Funkcije za recenzije ****
  openReviewForm(tourId: number): void {
    this.selectedTourIdForReview = tourId;
    this.showReviewForm = true;
  }

  closeReviewForm(): void {
    this.showReviewForm = false;
    this.selectedTourIdForReview = null;
  }

  onReviewSubmitted(): void {
    console.log('Recenzija uspešno poslata!');
    this.closeReviewForm();
  }
  // **** KRAJ NOVIH FUNKCIJA ZA RECENZIJE ****

  getDifficultyLabel(difficulty: Difficulty): string {
    switch (difficulty) {
      case Difficulty.EASY: return 'Lako';
      case Difficulty.MEDIUM: return 'Srednje';
      case Difficulty.HARD: return 'Teško';
      default: return difficulty;
    }
  }

  getStatusLabel(status: TourStatus): string {
    // Koristi getDisplayName iz enuma
    // S obzirom da smo u TourStatus enum dodali displayName
    // export enum TourStatus { DRAFT("Nacrt"), PUBLISHED("Objavljeno"), ARCHIVED("Arhivirano"); ... }
    // Moramo da pristupimo tom displayName-u. Ako Tour model direktno mapira na string, onda može i ovako:
    // return status; // Ako backend šalje "Nacrt", "Objavljeno" itd.

    // Ako Tour model šalje DRAFT, PUBLISHED, ARCHIVED:
    switch (status) {
      case TourStatus.DRAFT: return 'Nacrt'; // Ovde koristimo hardkodovane vrednosti za prikaz
      case TourStatus.PUBLISHED: return 'Objavljeno';
      case TourStatus.ARCHIVED: return 'Arhivirano';
      default: return status;
    }
  }

  getStatusClass(status: TourStatus): string {
    switch (status) {
      case TourStatus.DRAFT: return 'status-draft';
      case TourStatus.PUBLISHED: return 'status-published';
      case TourStatus.ARCHIVED: return 'status-archived';
      default: return '';
    }
  }

  isTourRunnable(status: TourStatus): boolean {
    return status === TourStatus.PUBLISHED || status === TourStatus.ARCHIVED;
  }

  addToCart(tour: Tour): void {
    // TODO: Implement cart functionality
    alert(`Dodato u korpu: ${tour.naziv}`);
  }

  publishTour(tour: Tour): void {
    this.tourService.publishTour(tour.id).subscribe({
      next: () => {
        this.loadTours();
        alert('Tura je uspešno objavljena!');
      },
      error: (error) => {
        alert('Greška pri objavljivanju ture: ' + (error.error?.error || error.message));
      }
    });
  }

  archiveTour(tour: Tour): void {
    if (confirm(`Da li ste sigurni da želite da arhivirate turu "${tour.naziv}"?`)) {
      this.tourService.archiveTour(tour.id).subscribe({
        next: () => {
          this.loadTours();
          alert('Tura je uspešno arhivirana!');
        },
        error: (error) => {
          alert('Greška pri arhiviranju ture: ' + (error.error?.error || error.message));
        }
      });
    }
  }

  activateTour(tour: Tour): void {
    if (confirm(`Da li ste sigurni da želite da aktivirate turu "${tour.naziv}"?`)) {
      this.tourService.activateTour(tour.id).subscribe({
        next: () => {
          this.loadTours();
          alert('Tura je uspešno aktivirana!');
        },
        error: (error) => {
          alert('Greška pri aktiviranju ture: ' + (error.error?.error || error.message));
        }
      });
    }
  }

  getFirstKeyPoint(tourId: number): KeyPoint | undefined {
    return this.firstKeyPointsMap.get(tourId);
  }

  formatDuzina(duzina?: number): string {
    if (!duzina || duzina === 0) {
      return 'N/A';
    }
    return duzina.toFixed(2) + ' km';
  }

  getTransportTime(tour: Tour, transport: string): string {
    if (!tour.prevozi || !tour.prevozi[transport]) {
      return 'N/A';
    }
    const minutes = tour.prevozi[transport];
    if (minutes === 0) {
      return 'N/A';
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  }

  // Format duration from minutes to hours and minutes
  formatDuration(minutes?: number): string {
    if (!minutes || minutes === 0) {
      return 'N/A';
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}min`;
    } else if (hours > 0) {
      return `${hours}h`;
    }
    return `${mins}min`;
  }
}
