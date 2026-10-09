import {Component, computed, inject} from "@angular/core";
import {MatButtonModule} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatRipple} from '@angular/material/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {UserProfileComponent} from '../user-profile/user-profile.component';
import {MatMenuModule} from '@angular/material/menu';
import {toSignal} from '@angular/core/rxjs-interop';
import {ThemeService} from '@common/services/theme.service';
import {AuthStore, DialogManager} from '@common/services';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.scss',
  imports: [
    MatButtonModule,
    MatIcon,
    MatRipple,
    RouterLink,
    RouterLinkActive,
    UserProfileComponent,
    MatMenuModule,
  ]
})
export class AppHeader {
  readonly themeService = inject(ThemeService);
  readonly authStore = inject(AuthStore);
  readonly dialogManager = inject(DialogManager);

  readonly pages = [
    { url: '/', name: 'Forecast', icon: 'show_chart' },
    { url: '/expected-expenses', name: 'Plan', icon: 'event_note' },
    { url: '/savings', name: 'Savings', icon: 'savings' },
    { url: '/currencies', name: 'Currencies', icon: 'currency_exchange' },
  ];

  readonly user = toSignal(this.authStore.user$);
  readonly userInitials = computed(() => (this.user()?.email?.charAt(0) || '').toUpperCase());

  openAuthDialog(): void {
    this.dialogManager.openDialog('auth-form', {});
  }

  openUserProfile(): void {
    this.dialogManager.openDialog('user-profile', {});
  }
}
