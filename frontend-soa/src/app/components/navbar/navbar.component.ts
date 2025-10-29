import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [RouterModule, CommonModule]
})
export class NavbarComponent {

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  isUserLoggedIn(): boolean {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('jwt_token')) {
      return true;
    }
    return false;
  }

  isAdmin(): boolean {
    return this.authService.getRole() === 'ROLE_ADMIN';
  }

  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('jwt_token');
    }
    this.router.navigate(['/login']);
  }
}
