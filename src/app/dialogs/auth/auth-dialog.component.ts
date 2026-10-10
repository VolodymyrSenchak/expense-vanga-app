import {afterNextRender, Component, ElementRef, inject, signal, viewChild} from '@angular/core';
import {environment} from '../../../environments/environment';
import {ThemeService} from '@common/services/theme.service';
import {GoogleCredentialResponse, loadGoogleIdentity} from '@common/utils/google-identity.utils';
import {
  MAT_DIALOG_DATA,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {ActualExpenseDialogParams} from '../../pages/home/actual-expense-dialog/actual-expense-dialog.component';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatError} from '@angular/material/form-field';
import {AuthService, AuthStore, DialogManager} from '@common/services';
import {firstValueFrom} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-auth-dialog',
  imports: [
    MatButton,
    MatDialogContent,
    MatDialogTitle,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    MatError
  ],
  templateUrl: './auth-dialog.component.html',
  styleUrl: './auth-dialog.component.scss'
})
export class AuthDialogComponent {
  readonly dialogRef = inject(MatDialogRef<AuthDialogComponent>);
  readonly data = inject<ActualExpenseDialogParams>(MAT_DIALOG_DATA);

  readonly authStore = inject(AuthStore);
  readonly fb = inject(FormBuilder);
  readonly dialogManager = inject(DialogManager);
  readonly authService = inject(AuthService);
  readonly snackBar = inject(MatSnackBar);
  readonly themeService = inject(ThemeService);

  private readonly googleButton = viewChild.required<ElementRef<HTMLElement>>('googleButton');
  readonly googleError = signal<string | null>(null);

  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor() {
    afterNextRender(() => void this.renderGoogleButton());
  }

  private async renderGoogleButton(): Promise<void> {
    if (!environment.googleClientId) {
      this.googleError.set(
        'Google sign-in is not configured. Set googleClientId in src/environments/environment.ts.',
      );
      return;
    }
    try {
      const google = await loadGoogleIdentity();
      google.initialize({
        client_id: environment.googleClientId,
        callback: (response) => void this.onGoogleLogin(response),
        cancel_on_tap_outside: true,
      });
      google.renderButton(this.googleButton().nativeElement, {
        theme: this.themeService.isDark() ? 'filled_black' : 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'pill',
        logo_alignment: 'left',
        width: 280,
      });
    } catch (err) {
      this.googleError.set('Could not load the Google sign-in button.');
    }
  }

  private async onGoogleLogin(response: GoogleCredentialResponse): Promise<void> {
    this.googleError.set(null);
    try {
      await firstValueFrom(this.authService.loginWithGoogle(response.credential));
      this.snackBar.open('Login successful', 'Close', {duration: 2000});
      this.dialogRef.close();
    } catch (err) {
      this.googleError.set('Google sign-in failed. Please try again.');
    }
  }

  async onLogin(): Promise<void> {
    try {
      if (!this.loginForm.valid) return;

      await firstValueFrom(
        this.authService.login({
          email: this.loginForm.value.email!,
          password: this.loginForm.value.password!,
        }));
      this.snackBar.open('Login successful', 'Close', {duration: 2000});
      this.dialogRef.close();
    } catch (err) {
      this.snackBar.open('Login failed. Please try again.', 'Close', {duration: 2000});
      this.loginForm.reset();
    }
  }

  goToRegister(): void {
    this.dialogRef.close();
    this.dialogManager.openDialog('register-form', {});
  }

  resetPassword(): void {
    this.dialogRef.close();
    this.dialogManager.openDialog('password-reset-dialog', {});
  }

  onContinueLocally(): void {
    this.authStore.clearAuth();
    this.dialogRef.close();
  }
}
