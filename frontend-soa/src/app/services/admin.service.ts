import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:8080/api/stakeholders';

  constructor(private http: HttpClient) { }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`);
  }

  getUserByUsername(username: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/username/${username}`);
  }

  blockUser(id: number): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}/block`, {});
  }

  unblockUser(id: number): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}/unblock`, {});
  }

  getUsersByRole(role: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users/role/${role}`);
  }

  getBlockedUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users/blocked`);
  }

  getActiveUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users/active`);
  }
}