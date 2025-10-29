import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserProfile } from '../models/user-profile.model';
import { AuthService } from './auth/auth';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private apiUrl = 'http://localhost:8080/api/stakeholders/users/profile';
  private loginUrl = 'http://localhost:8080/api/stakeholders/auth/login';
  
  constructor(private http: HttpClient, private authService: AuthService) { }

  private getAuthHeaders(contentType: string | null = 'application/json'): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    if (contentType) {
      headers = headers.set('Content-Type', contentType);
    }
    return headers;
  }

  getUserProfile(userId: number): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/${userId}`, { headers: this.getAuthHeaders() });
  }

  createOrUpdateUserProfile(userId: number, profile: UserProfile): Observable<UserProfile> {
    const profileToSend = {
      firstName: profile.firstName,
      lastName: profile.lastName,
      profilePicture: profile.profilePicture,
      biography: profile.biography,
      motto: profile.motto
    };
    return this.http.post<UserProfile>(`${this.apiUrl}/${userId}`, profileToSend, { headers: this.getAuthHeaders() });
  }

  uploadProfilePicture(userId: number, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    const headersForUpload = this.getAuthHeaders(null);
    
    return this.http.post(`${this.apiUrl}/upload-picture/${userId}`, formData, {
      headers: headersForUpload,
      responseType: 'text'
    });
  }
}