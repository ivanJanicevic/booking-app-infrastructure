import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TourExecution } from '../models/tour-execution.model';

@Injectable({
  providedIn: 'root'
})
export class TourExecutionService {
  private apiUrl = 'http://localhost:8080/api/tours/tour-execution';

  constructor(private http: HttpClient) { }

  startTour(tourId: number, initialLatitude: number, initialLongitude: number): Observable<TourExecution> {
    const body = { tourId, initialLatitude, initialLongitude };
    return this.http.post<TourExecution>(`${this.apiUrl}/start`, body);
  }

  getActiveTourExecution(): Observable<TourExecution> {
    return this.http.get<TourExecution>(`${this.apiUrl}/active`);
  }

  updateLocationAndCheckKeyPoints(executionId: number, latitude: number, longitude: number): Observable<TourExecution> {
    const body = { latitude, longitude };
    return this.http.put<TourExecution>(`${this.apiUrl}/${executionId}/update-location`, body);
  }

  completeTour(executionId: number): Observable<TourExecution> {
    return this.http.put<TourExecution>(`${this.apiUrl}/${executionId}/complete`, {});
  }

  abandonTour(executionId: number): Observable<TourExecution> {
    return this.http.put<TourExecution>(`${this.apiUrl}/${executionId}/abandon`, {});
  }
}