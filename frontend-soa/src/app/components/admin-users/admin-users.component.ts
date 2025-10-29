import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth/auth';
import { User } from '../../models/user.model';
import { UserRole } from '../../models/user-role.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css'
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  loading = false;
  error: string | null = null;
  searchTerm: string = '';
  selectedRole: string = 'ALL';
  showBlockedOnly = false;

  constructor(
    private adminService: AdminService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    // Check if user is admin
    const role = this.authService.getRole();
    if (role !== 'ROLE_ADMIN') {
      this.error = 'Samo administratori mogu pristupiti ovoj stranici';
      return;
    }

    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.error = null;

    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Greška pri učitavanju korisnika: ' + (error.error?.message || error.message);
        this.loading = false;
      }
    });
  }

  blockUser(user: User) {
    if (!user.id) {
      this.error = 'Greška: Korisnik nema ID';
      return;
    }

    if (confirm(`Da li ste sigurni da želite da blokirate korisnika "${user.username}"?`)) {
      this.adminService.blockUser(user.id || 1).subscribe({
        next: () => {
          user.blocked = true;
          this.error = null;
        },
        error: (error) => {
          this.error = 'Greška pri blokiranju korisnika: ' + (error.error?.message || error.message);
        }
      });
    }
  }

  unblockUser(user: User) {
    if (!user.id) {
      this.error = 'Greška: Korisnik nema ID';
      return;
    }

    if (confirm(`Da li ste sigurni da želite da odblokirate korisnika "${user.username}"?`)) {
      this.adminService.unblockUser(user.id || 1).subscribe({
        next: () => {
          user.blocked = false;
          this.error = null;
        },
        error: (error) => {
          this.error = 'Greška pri odblokiranju korisnika: ' + (error.error?.message || error.message);
        }
      });
    }
  }

  getRoleLabel(role: UserRole): string {
    switch (role) {
      case UserRole.ROLE_ADMIN: return 'Administrator';
      case UserRole.ROLE_GUIDE: return 'Vodič';
      case UserRole.ROLE_TOURIST: return 'Turista';
      default: return role;
    }
  }

  getRoleClass(role: UserRole): string {
    switch (role) {
      case UserRole.ROLE_ADMIN: return 'role-admin';
      case UserRole.ROLE_GUIDE: return 'role-guide';
      case UserRole.ROLE_TOURIST: return 'role-tourist';
      default: return '';
    }
  }

  get filteredUsers(): User[] {
    let filtered = this.users;

    // Filter out admins from the list
    filtered = filtered.filter(user => user.role !== UserRole.ROLE_ADMIN);
    filtered = filtered.filter(user => user.role !== UserRole.ROLE_ADMIN);

    // Filter by search term
    if (this.searchTerm) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (this.selectedRole !== 'ALL') {
      filtered = filtered.filter(user => user.role === this.selectedRole);
    }

    // Filter by blocked status
    if (this.showBlockedOnly) {
      filtered = filtered.filter(user => user.blocked);
    }

    return filtered;
  }
}

