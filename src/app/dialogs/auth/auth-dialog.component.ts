import {Component, inject} from '@angular/core';
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

  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

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
