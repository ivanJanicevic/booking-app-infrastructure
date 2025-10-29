import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { KeyPoint, CreateKeyPointRequest } from '../models/keypoint.model';
import { AuthService } from './auth/auth';

@Injectable({
  providedIn: 'root'
})
export class KeyPointService {
  private apiUrl = 'http://localhost:8080/api/tours/keypoints';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  createKeyPoint(keyPointData: CreateKeyPointRequest): Observable<KeyPoint> {
    return this.http.post<KeyPoint>(this.apiUrl, keyPointData, {
      headers: this.getHeaders()
    });
  }

  getAllKeyPointsByAuthor(): Observable<KeyPoint[]> {
    return this.http.get<KeyPoint[]>(this.apiUrl, {
      headers: this.getHeaders()
    });
  }

  getKeyPointsByTour(tourId: number): Observable<KeyPoint[]> {
    return this.http.get<KeyPoint[]>(`${this.apiUrl}/tour/${tourId}`, {
      headers: this.getHeaders()
    });
  }

  getKeyPointById(id: number): Observable<KeyPoint> {
    return this.http.get<KeyPoint>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  updateKeyPoint(id: number, keyPointData: CreateKeyPointRequest): Observable<KeyPoint> {
    return this.http.put<KeyPoint>(`${this.apiUrl}/${id}`, keyPointData, {
      headers: this.getHeaders()
    });
  }

  deleteKeyPoint(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  getKeyPointCountByTour(tourId: number): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/tour/${tourId}/count`, {
      headers: this.getHeaders()
    });
  }

  getKeyPointCountByAuthor(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/count`, {
      headers: this.getHeaders()
    });
  }

  getFirstKeyPointByTour(tourId: number): Observable<KeyPoint> {
    return this.http.get<KeyPoint>(`${this.apiUrl}/tour/${tourId}/first`, {
      headers: this.getHeaders()
    });
  }
}