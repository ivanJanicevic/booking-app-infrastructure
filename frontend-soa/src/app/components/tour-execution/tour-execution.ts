import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TourExecutionService } from '../../services/tour-execution.service';
import { Subscription, interval, switchMap, tap, catchError, of } from 'rxjs';
import { TouristLocationService } from '../../services/tourist-location';
import { KeyPointService } from '../../services/keypoint.service';
import { TourExecution, TourExecutionStatus } from '../../models/tour-execution.model';
import { KeyPoint } from '../../models/keypoint.model';
import { AuthService } from '../../services/auth/auth';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Simulator } from '../../pages/simulator/simulator';
import { TourMapComponent } from '../tour-map/tour-map';

@Component({
  selector: 'app-tour-execution',
  standalone: true,
  imports: [CommonModule, MatDialogModule, TourMapComponent],
  templateUrl: './tour-execution.html',
  styleUrls: ['./tour-execution.css']
})
export class TourExecutionComponent implements OnInit, OnDestroy {
  tourExecutionId: number | null = null;
  currentExecution: TourExecution | null = null;
  tourKeyPoints: KeyPoint[] = [];
  loading = true;
  error: string | null = null;
  locationUpdateInterval: Subscription | null = null;
  TourExecutionStatus = TourExecutionStatus;

  private simulatorDialogRef: any;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private tourExecutionService: TourExecutionService,
    private touristLocationService: TouristLocationService,
    private keyPointService: KeyPointService,
    private authService: AuthService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.tourExecutionId = +id;
        this.loadTourExecution();
      } else {
        this.error = 'ID izvršenja ture nije pronađen.';
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.stopLocationUpdates();
    this.closePositionSimulator();
  }

  loadTourExecution(): void {
    if (!this.tourExecutionId) return;

    this.tourExecutionService.getActiveTourExecution().pipe(
      tap(execution => {
        if (execution && execution.id === this.tourExecutionId) {
          this.currentExecution = execution;
          this.loading = false;
          console.log('Učitana aktivna tura:', execution);
          this.loadTourKeyPoints(execution.tourId);
          if (execution.status === TourExecutionStatus.STARTED) {
            this.startLocationUpdates();
          } else {
            this.stopLocationUpdates();
            alert(`Tura je ${execution.status === TourExecutionStatus.COMPLETED ? 'završena' : 'napuštena'}.`);
            this.router.navigate(['/tours']);
          }
        } else {
          this.error = 'Nije pronađena aktivna tura sa ovim ID-jem ili ne pripada korisniku.';
          this.loading = false;
          this.router.navigate(['/tours']);
        }
      }),
      catchError(err => {
        this.error = `Greška pri učitavanju izvršenja ture: ${err.error?.error || err.message}`;
        this.loading = false;
        console.error(this.error, err);
        this.router.navigate(['/tours']);
        return of(null);
      })
    ).subscribe();
  }

  loadTourKeyPoints(tourId: number): void {
    this.keyPointService.getKeyPointsByTour(tourId).pipe(
      tap(keyPoints => {
        this.tourKeyPoints = keyPoints;
        console.log('Učitane ključne tačke:', keyPoints);
      }),
      catchError(err => {
        console.error('Greška pri učitavanju ključnih tačaka:', err);
        return of([]);
      })
    ).subscribe();
  }

  startLocationUpdates(): void {
    this.stopLocationUpdates();

    this.locationUpdateInterval = interval(10000)
      .pipe(
        // Vraćena logika za otvaranje simulatora
        tap(() => {
          if (this.currentExecution?.status === TourExecutionStatus.STARTED) {
            console.log("TourExecution: Pokušavam da otvorim simulator.");
            this.openPositionSimulatorAsPopup();
          }
        }),
        switchMap(() => this.touristLocationService.getCurrentLocation(this.authService.getUsername() || '')),
        switchMap(position => {
          if (this.tourExecutionId && this.currentExecution && position) {
            console.log(`Šaljem ažuriranje lokacije: ${position.latitude}, ${position.longitude}`);
            // Nema potrebe za updateTouristMarker ovde, TourMapComponent će reagovati na promenu currentLatitude/Longitude
            return this.tourExecutionService.updateLocationAndCheckKeyPoints(
              this.tourExecutionId,
              position.latitude,
              position.longitude
            );
          } else {
            console.warn('Nema ID-ja izvršenja ture ili lokacije za ažuriranje.');
            return of(null);
          }
        }),
        tap(updatedExecution => {
          if (updatedExecution) {
            this.currentExecution = updatedExecution;
            console.log('Ažurirano izvršenje ture:', updatedExecution);
            // Nema potrebe za addKeyPointMarkers ovde, TourMapComponent će reagovati na promenu completedKeyPoints
            if (updatedExecution.status !== TourExecutionStatus.STARTED) {
              this.stopLocationUpdates();
              this.closePositionSimulator();
              alert(`Tura je ${updatedExecution.status === TourExecutionStatus.COMPLETED ? 'završena' : 'napuštena'}!`);
              this.router.navigate(['/tours']);
            }
          }
        }),
        catchError(err => {
          this.error = `Greška pri ažuriranju lokacije: ${err.error?.error || err.message}`;
          console.error(this.error, err);
          return of(null);
        })
      )
      .subscribe();
  }

  stopLocationUpdates(): void {
    if (this.locationUpdateInterval) {
      this.locationUpdateInterval.unsubscribe();
      this.locationUpdateInterval = null;
      console.log('Zaustavljeno ažuriranje lokacije.');
    }
  }

  openPositionSimulatorAsPopup(): void {
    // Proveri da li simulator već nije otvoren
    if (this.simulatorDialogRef && this.simulatorDialogRef.getState() === 0 /* OPEN */) {
      console.log('Simulator dialog je već otvoren, ne otvaram novi.');
      return; // Ne otvaraj novi dialog ako je već otvoren
    }

    if (this.simulatorDialogRef) {
      this.simulatorDialogRef.close(); // Zatvori prethodni ako postoji i nije OPEN
    }

    this.simulatorDialogRef = this.dialog.open(Simulator, {
      width: '800px',
      height: '600px',
      panelClass: 'custom-simulator-dialog',
      position: { top: '50px', right: '50px' },
      disableClose: false // Omogući zatvaranje od strane korisnika
    });

    this.simulatorDialogRef.afterOpened().subscribe(() => {
      console.log('Simulator dialog je otvoren.');
    });

    this.simulatorDialogRef.afterClosed().subscribe((result: any) => {
      console.log('Simulator dialog je zatvoren', result);
      this.simulatorDialogRef = null;
    });
  }

  closePositionSimulator(): void {
    if (this.simulatorDialogRef) {
      this.simulatorDialogRef.close();
      this.simulatorDialogRef = null;
    }
  }

  completeTour(): void {
    if (this.tourExecutionId) {
      this.tourExecutionService.completeTour(this.tourExecutionId).pipe(
        tap(execution => {
          this.currentExecution = execution;
          alert('Tura je uspešno završena!');
          this.stopLocationUpdates();
          this.closePositionSimulator();
          this.router.navigate(['/tours']);
        }),
        catchError(err => {
          this.error = `Greška pri završavanju ture: ${err.error?.error || err.message}`;
          console.error(this.error, err);
          alert(this.error);
          return of(null);
        })
      ).subscribe();
    }
  }

  abandonTour(): void {
    if (this.tourExecutionId) {
      if (confirm('Da li ste sigurni da želite da napustite turu?')) {
        this.tourExecutionService.abandonTour(this.tourExecutionId).pipe(
          tap(execution => {
            this.currentExecution = execution;
            alert('Tura je uspešno napuštena.');
            this.stopLocationUpdates();
            this.closePositionSimulator();
            this.router.navigate(['/tours']);
          }),
          catchError(err => {
            this.error = `Greška pri napuštanju ture: ${err.error?.error || err.message}`;
            console.error(this.error, err);
            alert(this.error);
            return of(null);
          })
        ).subscribe();
      }
    }
  }

  getTourExecutionStatusLabel(status: TourExecutionStatus): string {
    switch (status) {
      case TourExecutionStatus.STARTED: return 'Aktivna';
      case TourExecutionStatus.COMPLETED: return 'Završena';
      case TourExecutionStatus.ABANDONED: return 'Napuštena';
      default: return '';
    }
  }

  isKeyPointCompleted(keyPointId: number): boolean {
    return this.currentExecution?.completedKeyPoints.includes(keyPointId) || false;
  }
}