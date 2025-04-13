import {Component, computed, inject, signal} from '@angular/core';
import {AuthStore, DialogManager} from '@common/services';
import {User} from '@common/models/auth';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-user-profile',
  imports: [
    MatButton
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent {
  readonly authStore = inject(AuthStore);
  readonly dialogManager = inject(DialogManager);

  readonly user = signal<User | null>(null);
  readonly isAuthenticated = computed(() => !!this.user());

  openAuthDialog() {
    this.dialogManager.openDialog('auth-form', {});
  }
}
