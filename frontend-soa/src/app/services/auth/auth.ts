import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

export interface LoginRequest {
  username: string;
  password?: string; 
}

export interface LoginResponse {
  token: string; 
}

export interface DecodedToken {
  sub: string;    
  role: string;   
  exp: number;    
  iat: number;  
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loginUrl = 'http://localhost:8080/api/stakeholders/auth/login';

  constructor(private http: HttpClient) { }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.loginUrl, credentials).pipe(
      tap(response => {
        this.saveToken(response.token);
      })
    );
  }

  private saveToken(token: string): void {
    localStorage.setItem('jwt_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
  }

  getUser(): DecodedToken | null {
    const token = this.getToken();

    if (token) {
      try {
        const decodedToken: DecodedToken = jwtDecode(token);
        return decodedToken;
      } catch (error) {
        console.error("Greška prilikom dekodiranja tokena:", error);
        return null;
      }
    }

    return null;
  }

  getUsername(): string | null {
    const user = this.getUser();
    return user ? user.sub : null;
  }

  getRole(): string | null {
    const user = this.getUser();
    return user ? user.role : null;
  }

  getUserId(): any | null {
    const user: any = this.getUser();
    return user ? user.id : null; 
  }
}