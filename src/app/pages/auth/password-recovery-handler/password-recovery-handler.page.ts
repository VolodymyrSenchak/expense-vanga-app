import {Component, inject, OnInit } from '@angular/core';
import {AuthService, AuthStore } from '@common/services';
import {ActivatedRoute, Router} from '@angular/router';
import {firstValueFrom} from 'rxjs';

@Component({
  selector: 'app-password-recovery-handler-page',
  imports: [],
  template: '',
})
export class PasswordRecoveryHandlerPage implements OnInit {
  readonly activatedRoute = inject(ActivatedRoute);
  readonly authStore = inject(AuthStore);
  readonly authService = inject(AuthService);
  readonly router = inject(Router);

  async ngOnInit(): Promise<void> {
    await this.tryAuthenticateUser();
    await this.router.navigateByUrl('/#modal=change-password');
  }

  private async tryAuthenticateUser(): Promise<void> {
    const fragment = this.activatedRoute.snapshot.fragment;

    if (!fragment) return;

    const params = new URLSearchParams(fragment || '');
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');

    if (!access_token || !refresh_token) return;

    this.authStore.setSession({ access_token, refresh_token });
    try {
      const user = await firstValueFrom(this.authService.getUserDetails());
      this.authStore.setUser(user);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      this.authStore.clearAuth();
    }
  }
}
