import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule // <-- Važno za rad sa reaktivnim formama
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string | null = null;

  // Moderni način za dependency injection
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  constructor() {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['ROLE_TOURIST', Validators.required] // 'tourist' je podrazumevana vrednost
    });
  }

  onSubmit(): void {
    // Resetuj poruku o grešci
    this.errorMessage = null;

    // Proveri da li je forma validna
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched(); // Prikazi greske za sva polja
      return;
    }

    const registerData = this.registerForm.value;
    const apiUrl = 'http://localhost:8080/api/stakeholders/auth/register';

    this.http.post(apiUrl, registerData).subscribe({
      next: (response) => {
        console.log('Registracija uspešna!', response);
        this.router.navigate(['/login']); 
      },
      error: (err) => {
        console.error('Došlo je do greške prilikom registracije:', err);
        this.errorMessage = 'Registracija nije uspela. Proverite podatke i pokušajte ponovo.';
      }
    });
  }
}