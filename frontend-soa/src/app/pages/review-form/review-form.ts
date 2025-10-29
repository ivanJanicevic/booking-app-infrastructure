import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateReviewRequest } from '../../models/review.model';
import { ReviewService } from '../../services/review.service';
import { firstValueFrom } from 'rxjs'; // Potrebno za moderni async/await
import { AuthService } from '../../services/auth/auth';

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-form.html',
  styleUrls: ['./review-form.css']
})
export class ReviewFormComponent implements OnInit {
  @Input() tourId!: number; // ID ture za koju se piše recenzija
  @Output() reviewSubmitted = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  review: CreateReviewRequest = {
    rating: 5,
    comment: '',
    touristName: '', // Novo polje
    tourId: 0,
    dateVisited: new Date().toISOString().split('T')[0], // Današnji datum kao default
    images: [] // ✅ Ovo će sada čuvati URL stringove
  };
  imageFiles: File[] = [];
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(private reviewService: ReviewService, private authService: AuthService) {}

  ngOnInit(): void {
    this.review.tourId = this.tourId;
    this.review.touristName = this.authService.getUsername() || "Upiste vase ime";
  }

  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.imageFiles = Array.from(event.target.files);
      console.log('Selected image files:', this.imageFiles);
    }
  }

  submitForm(): void { // Metoda je vraćena na sinhronu
    this.loading = true;
    this.error = null;
    this.successMessage = null;

    try {
      let imagePaths: string[] = [];

      // 1. KREIRANJE PRIVREMENIH BROWSER PUTANJA
      // Koristi se URL.createObjectURL() za dobijanje kratke, privremene putanje (URL)
      // koja služi samo za prikaz unutar pretraživača.
      if (this.imageFiles.length > 0) {
        imagePaths = this.imageFiles.map(file => {
          // Putanja će izgledati ovako: blob:http://localhost:4200/98d638c4-177b-40b5-9b2f-90e6358c5a92
          return URL.createObjectURL(file);
        });
        console.log('Generated local paths:', imagePaths);
      }

      // 2. AŽURIRANJE RECENZIJE SA PUTANJAMA
      // ✅ this.review.images sada sadrži niz privremenih URL stringova
      this.review.images = imagePaths; 

      // 3. SLANJE RECENZIJE (tekstualni podaci i privremene putanje)
      // NAPOMENA: Ove putanje NEĆE RADITI na backendu niti nakon restarta browsera.
      this.reviewService.submitReview(this.review).subscribe({
        next: () => {
          this.successMessage = 'Recenzija uspešno poslata!';
          this.loading = false;
          this.reviewSubmitted.emit();
          // Oslobađanje privremenih URL-ova nakon slanja (dobra praksa)
          imagePaths.forEach(url => URL.revokeObjectURL(url));
          setTimeout(() => this.close.emit(), 2000);
        },
        error: (err) => {
          // Ovaj error je od slanja recenzije (JSON)
          this.error = 'Greška pri slanju recenzije: ' + (err.error?.message || err.message);
          this.loading = false;
        }
      });
    } catch (err) {
      console.error('Error during submission:', err);
      this.error = 'Došlo je do greške pri obradi podataka.';
      this.loading = false;
    }
  }

  cancel(): void {
    this.close.emit();
  }
}
