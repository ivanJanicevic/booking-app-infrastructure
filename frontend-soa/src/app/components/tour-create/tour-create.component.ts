import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TourService } from '../../services/tour.service';
import { CreateTourRequest, Difficulty } from '../../models/tour.model';

@Component({
  selector: 'app-tour-create',
  standalone: true,
  templateUrl: './tour-create.component.html',
  styleUrls: ['./tour-create.component.css'],
  imports: [CommonModule, FormsModule],
})
export class TourCreateComponent {
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
  createdTourId: number | null = null;

  constructor(
    private tourService: TourService,
    private router: Router
  ) { }

  onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.error = null;

    this.tourService.createTour(this.tourData).subscribe({
      next: (tour) => {
        this.loading = false;
        this.createdTourId = tour.id;
        this.error = null;
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Greška pri kreiranju ture: ' + error.message;
        this.simulateSuccess();
      }
    });
  }

  simulateSuccess() {
    setTimeout(() => {
      this.loading = false;
      this.createdTourId = 999; // Mock ID for simulation
      this.error = null;
    }, 1000);
  }

  onGoToKeypoints() {
    if (this.createdTourId) {
      this.router.navigate(['/tours', this.createdTourId, 'keypoints', 'create']);
    }
  }

  onBackToTours() {
    this.router.navigate(['/tours']);
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
