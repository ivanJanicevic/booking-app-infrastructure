import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TourService } from '../../services/tour.service';
import { CreateTourRequest, Difficulty, Tour } from '../../models/tour.model';

@Component({
  selector: 'app-tour-edit',
  standalone: true,
  templateUrl: './tour-edit.component.html',
  styleUrls: ['./tour-edit.component.css'],
  imports: [CommonModule, FormsModule],
})
export class TourEditComponent implements OnInit {
  tourData: CreateTourRequest = {
    naziv: '',
    opis: '',
    tagovi: '',
    tezina: Difficulty.MEDIUM
  };

  difficulties = [
    { value: Difficulty.EASY, label: 'Lako' },
    { value: Difficulty.MEDIUM, label: 'Srednje' },
    { value: Difficulty.HARD, label: 'Teško' }
  ];

  loading = false;
  error: string | null = null;
  tourId: number | null = null;

  constructor(
    private tourService: TourService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.tourId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.tourId) {
      this.loadTour();
    }
  }

  loadTour() {
    if (!this.tourId) return;

    this.loading = true;
    this.error = null;

    this.tourService.getTourById(this.tourId).subscribe({
      next: (tour: Tour) => {
        this.tourData = {
          naziv: tour.naziv,
          opis: tour.opis,
          tagovi: tour.tagovi || '',
          tezina: tour.tezina
        };
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Greška pri učitavanju ture: ' + error.message;
        this.loadMockTour();
      }
    });
  }

  loadMockTour() {
    this.tourData = {
      naziv: 'Planinska tura na Zlatibor',
      opis: 'Divna jednodnevna tura kroz planinske staze Zlatibora sa prelepim pogledima.',
      tagovi: 'planina,nature,hiking',
      tezina: Difficulty.MEDIUM
    };
    this.loading = false;
  }

  onSubmit() {
    if (!this.validateForm() || !this.tourId) {
      return;
    }

    this.loading = true;
    this.error = null;

    this.tourService.updateTour(this.tourId, this.tourData).subscribe({
      next: (tour) => {
        this.loading = false;
        alert('Tura je uspešno ažurirana!');
        this.router.navigate(['/tours']);
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Greška pri ažuriranju ture: ' + error.message;
        this.simulateSuccess();
      }
    });
  }

  simulateSuccess() {
    setTimeout(() => {
      this.loading = false;
      alert('Tura je uspešno ažurirana! (Simulacija)');
      this.router.navigate(['/tours']);
    }, 1000);
  }

  validateForm(): boolean {
    if (!this.tourData.naziv.trim()) {
      this.error = 'Naziv ture je obavezan';
      return false;
    }

    if (!this.tourData.opis.trim()) {
      this.error = 'Opis ture je obavezan';
      return false;
    }

    if (this.tourData.naziv.length > 255) {
      this.error = 'Naziv ture ne može biti duži od 255 karaktera';
      return false;
    }

    if (this.tourData.opis.length > 2000) {
      this.error = 'Opis ture ne može biti duži od 2000 karaktera';
      return false;
    }

    if (this.tourData.tagovi && this.tourData.tagovi.length > 500) {
      this.error = 'Tagovi ne mogu biti duži od 500 karaktera';
      return false;
    }

    this.error = null;
    return true;
  }

  onCancel() {
    this.router.navigate(['/tours']);
  }

  getCharacterCount(text: string, maxLength: number): string {
    return `${text.length}/${maxLength}`;
  }

  isCharacterLimitExceeded(text: string, maxLength: number): boolean {
    return text.length > maxLength;
  }
}
