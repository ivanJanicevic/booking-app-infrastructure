import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review, CreateReviewRequest } from '../models/review.model';
import { AuthService } from './auth/auth'; // Pretpostavljam da imaš AuthService

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = 'http://localhost:8080/api/tours/reviews'; // Novi API endpoint za recenzije

  constructor(
    private http: HttpClient,
    private authService: AuthService // Koristi authService ako su potrebni tokeni
  ) { }

  private getHeaders(): HttpHeaders {
    // Ako je potrebno, dodaj Authorization header
    // const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json'
      // 'Authorization': `Bearer ${token}` // Primer, ako koristiš JWT
    });
  }

  submitReview(reviewData: CreateReviewRequest): Observable<Review> {
    return this.http.post<Review>(this.apiUrl, reviewData, { headers: this.getHeaders() });
  }

  // Opciono: metode za dobijanje recenzija za određenu turu
  getReviewsForTour(tourId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/tour/${tourId}`, { headers: this.getHeaders() });
  }
}