import { NotificationService } from './../../../../core/services/notification.service';
import { AuthService, User } from './../../../../core/services/auth.service';
// features/auth/components/user-profile/user-profile.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-user-profile',
  standalone: false,
  templateUrl: './user-profile.component.html'
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  profileForm!: FormGroup;
  editing: boolean = false;
  constructor(private auth: AuthService, private fb: FormBuilder, private notify: NotificationService) {}

  ngOnInit(): void {
    this.user = this.auth.currentUserSubject.value;
    // Build a form with user info (for potential editing)
    this.profileForm = this.fb.group({
      name: [this.user?.name || '', Validators.required],
      email: [{value: this.user?.email || '', disabled: true}],  // email not editable typically
    });
  }

  enableEdit(): void {
    this.editing = true;
    this.profileForm.get('name')?.enable();
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    // Here we would call backend to update user profile (not fully implemented in this example)
    const newName = this.profileForm.value.name;
    // Simulate update
    if (this.user) {
      this.user.name = newName;
      this.auth.tokenStorage.saveUser(this.user);
      this.auth.currentUserSubject.next(this.user);
    }
    this.notify.showSuccess('Profile updated.');
    this.editing = false;
    this.profileForm.get('name')?.disable();
  }
}
