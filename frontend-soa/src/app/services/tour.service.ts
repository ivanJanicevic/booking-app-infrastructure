import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tour, CreateTourRequest, TourStats, Difficulty, TourStatus, PublishTourRequest } from '../models/tour.model';
import { AuthService } from './auth/auth';

@Injectable({
  providedIn: 'root'
})
export class TourService {
  private apiUrl = 'http://localhost:8080/api/tours';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  createTour(tourData: CreateTourRequest): Observable<Tour> {
    return this.http.post<Tour>(this.apiUrl, tourData, {
      headers: this.getHeaders()
    });
  }

  getAllToursByAuthor(): Observable<Tour[]> {
    return this.http.get<Tour[]>(this.apiUrl, {
      headers: this.getHeaders()
    });
  }

  getTourById(id: number): Observable<Tour> {
    return this.http.get<Tour>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  getToursByStatus(status: TourStatus): Observable<Tour[]> {
    return this.http.get<Tour[]>(`${this.apiUrl}/status/${status}`, {
      headers: this.getHeaders()
    });
  }

  getToursByDifficulty(difficulty: Difficulty): Observable<Tour[]> {
    return this.http.get<Tour[]>(`${this.apiUrl}/difficulty/${difficulty}`, {
      headers: this.getHeaders()
    });
  }

  getToursByTag(tag: string): Observable<Tour[]> {
    return this.http.get<Tour[]>(`${this.apiUrl}/tag/${tag}`, {
      headers: this.getHeaders()
    });
  }

  updateTour(id: number, tourData: CreateTourRequest): Observable<Tour> {
    const params = new URLSearchParams();
    params.append('naziv', tourData.naziv);
    params.append('opis', tourData.opis);
    params.append('tagovi', tourData.tagovi || '');
    params.append('tezina', tourData.tezina);

    return this.http.put<Tour>(`${this.apiUrl}/${id}?${params.toString()}`, {}, {
      headers: this.getHeaders()
    });
  }

  deleteTour(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  getTourStats(): Observable<TourStats> {
    return this.http.get<TourStats>(`${this.apiUrl}/stats`, {
      headers: this.getHeaders()
    });
  }

  publishTour(id: number): Observable<Tour> {
    return this.http.put<Tour>(`${this.apiUrl}/${id}/publish`, {}, {
      headers: this.getHeaders()
    });
  }

  archiveTour(id: number): Observable<Tour> {
    return this.http.put<Tour>(`${this.apiUrl}/${id}/archive`, {}, {
      headers: this.getHeaders()
    });
  }

  activateTour(id: number): Observable<Tour> {
    return this.http.put<Tour>(`${this.apiUrl}/${id}/activate`, {}, {
      headers: this.getHeaders()
    });
  }

}
