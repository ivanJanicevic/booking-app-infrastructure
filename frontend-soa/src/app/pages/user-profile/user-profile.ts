// user-profile.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UserProfileService } from '../../services/user-profile';
import { UserProfile } from '../../models/user-profile.model';
import { switchMap } from 'rxjs/operators';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../models/environment.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.css'
})
export class UserProfileComponent implements OnInit, OnDestroy {
  userId!: number;
  userProfile: UserProfile | null = null;
  isEditing: boolean = false;
  editableProfile: UserProfile | null = null;
  defaultProfilePicture: string = 'https://via.placeholder.com/150';
  selectedFile: File | null = null;
  previewProfilePictureUrl: string | null = null;

  private destroy$ = new Subject<void>();
  private backendUrl = environment.apiUrl; // Store backend URL

  constructor(
    private route: ActivatedRoute,
    private userProfileService: UserProfileService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const idParam = params.get('userId');
      if (idParam) {
        this.userId = +idParam;
        this.loadUserProfile();
      } else {
        console.warn('User ID not provided in route. Using a default for testing.');
        this.userId = 20;
        this.loadUserProfile();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.revokePreviewUrl();
  }

  loadUserProfile(): void {
    if (this.userId) {
      this.userProfileService.getUserProfile(this.userId).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (profile) => {
          this.userProfile = profile;
          this.editableProfile = {
            ...profile,
            profilePicture: profile.profilePicture || this.defaultProfilePicture
          };
          this.resetFileSelection();
        },
        error: (error) => {
          console.error('Greška pri učitavanju profila:', error);
          if (error.status === 404) {
            console.log('Profil ne postoji, inicijalizujem novi.');
            this.userProfile = {
              firstName: '',
              lastName: '',
              profilePicture: this.defaultProfilePicture,
              biography: '',
              motto: ''
            };
            this.editableProfile = { ...this.userProfile };
            this.isEditing = true;
            this.resetFileSelection();
          } else {
            alert('Greška pri učitavanju profila.');
          }
        }
      });
    }
  }

  toggleEditMode(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing && this.userProfile) {
      this.editableProfile = {
        ...this.userProfile,
        profilePicture: this.userProfile.profilePicture || this.defaultProfilePicture
      };
    } else if (!this.isEditing && this.userProfile) {
      this.editableProfile = {
        ...this.userProfile,
        profilePicture: this.userProfile.profilePicture || this.defaultProfilePicture
      };
      this.resetFileSelection();
    }
  }

  saveProfile(): void {
    if (this.userId && this.editableProfile) {
      let uploadPictureObservable: Observable<string>;

      if (this.selectedFile) {
        uploadPictureObservable = this.userProfileService.uploadProfilePicture(this.userId, this.selectedFile);
      } else {
        uploadPictureObservable = of(this.editableProfile.profilePicture || '');
      }

      uploadPictureObservable.pipe(
        switchMap(imageUrl => {
          if (this.editableProfile) {
            // Store the path as returned by the backend (e.g., /uploads/profile-pictures/...)
            this.editableProfile.profilePicture = imageUrl;
          }
          return this.userProfileService.createOrUpdateUserProfile(this.userId, this.editableProfile!);
        }),
        takeUntil(this.destroy$)
      ).subscribe({
        next: (updatedProfile) => {
          this.userProfile = updatedProfile;
          this.isEditing = false;
          this.resetFileSelection();
          console.log('Profil uspešno sačuvan!', updatedProfile);
        },
        error: (error) => {
          console.error('Greška pri čuvanju profila:', error);
          alert('Došlo je do greške prilikom čuvanja profila.');
        }
      });
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    if (this.userProfile) {
      this.editableProfile = {
        ...this.userProfile,
        profilePicture: this.userProfile.profilePicture || this.defaultProfilePicture
      };
      this.resetFileSelection();
    }
  }

  // MODIFIED: Construct the full URL for display
  get currentProfilePictureForDisplay(): string {
    // If there's a file selected for preview, use its object URL
    if (this.previewProfilePictureUrl) {
      return this.previewProfilePictureUrl;
    }
    // If editableProfile has a relative path (e.g., /uploads/profile-pictures/...), prepend backend URL
    if (this.editableProfile?.profilePicture && this.editableProfile.profilePicture.startsWith('/uploads/')) {
        return this.backendUrl + this.editableProfile.profilePicture;
    }
    // Otherwise, use the picture directly (could be default or full URL already)
    return this.editableProfile?.profilePicture || this.defaultProfilePicture;
  }


  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      this.revokePreviewUrl();
      this.previewProfilePictureUrl = URL.createObjectURL(this.selectedFile);
    } else {
      this.resetFileSelection();
    }
  }

  private revokePreviewUrl(): void {
    if (this.previewProfilePictureUrl) {
      URL.revokeObjectURL(this.previewProfilePictureUrl);
      this.previewProfilePictureUrl = null;
    }
  }

  private resetFileSelection(): void {
    this.selectedFile = null;
    this.revokePreviewUrl();
    const fileInput = document.getElementById('profileImageUpload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}