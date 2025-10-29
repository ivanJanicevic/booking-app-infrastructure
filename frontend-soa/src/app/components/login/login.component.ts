import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;
  testMessage: string | null = null; 

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private http = inject(HttpClient); 


  constructor() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    this.errorMessage = null;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log('Login uspešan! Token je sačuvan u localStorage.');
        this.router.navigate(['/']); 
      },
      error: (loginErr) => {
        console.error('Došlo je do greške prilikom logovanja:', loginErr);
        
        // Check if the error is about blocked account
        const errorMessage = loginErr.error?.message || loginErr.error || loginErr.message;
        
        if (errorMessage && errorMessage.includes('blokiran')) {
          this.errorMessage = 'Vaš nalog je blokiran. Molimo kontaktirajte administratora.';
        } else if (errorMessage && errorMessage.includes('Korisnik nije pronađen')) {
          this.errorMessage = 'Korisničko ime ne postoji.';
        } else if (errorMessage && errorMessage.includes('lozinka')) {
          this.errorMessage = 'Pogrešna lozinka.';
        } else {
          this.errorMessage = errorMessage || 'Neispravno korisničko ime ili lozinka.';
        }
      }
    });
  }
}