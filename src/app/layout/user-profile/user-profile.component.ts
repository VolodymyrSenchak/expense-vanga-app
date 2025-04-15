import {Component, computed, inject } from '@angular/core';
import {AuthStore, DialogManager} from '@common/services';
import {MatButton} from '@angular/material/button';
import {toSignal} from '@angular/core/rxjs-interop';

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

  readonly user = toSignal(this.authStore.user$);
  readonly isAuthenticated = computed(() => !!this.user());
  readonly userInitials = computed(() => (this.user()?.email?.charAt(0) || '').toUpperCase());

  openAuthDialog() {
    this.dialogManager.openDialog('auth-form', {});
  }

  openUserProfile() {
    this.dialogManager.openDialog('user-profile', {});
  }
}
