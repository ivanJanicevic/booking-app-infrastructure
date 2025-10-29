import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface TouristLocation {
  id: number;
  username: string;
  latitude: number;
  longitude: number;
}

interface LocationUpdateRequest {
  username: string;
  latitude: number;
  longitude: number;
}

@Injectable({
  providedIn: 'root'
})
export class TouristLocationService {
  private apiUrl = 'http://localhost:8080/api/tours/tourist-location'; // Novi API endpoint za recenzije

  constructor(private http: HttpClient) { }

  updateLocation(location: LocationUpdateRequest): Observable<TouristLocation> {
    return this.http.post<TouristLocation>(`${this.apiUrl}/update`, location);
  }

  getCurrentLocation(username: string): Observable<TouristLocation> {
    return this.http.get<TouristLocation>(`${this.apiUrl}/current/${username}`);
  }
}