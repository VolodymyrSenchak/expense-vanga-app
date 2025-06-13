import {Component, inject} from '@angular/core';
import {
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatError} from '@angular/material/form-field';
import {AuthService } from '@common/services';
import {firstValueFrom} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-password-reset-dialog',
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
  templateUrl: './password-reset-dialog.component.html',
})
export class PasswordResetDialogComponent {
  readonly dialogRef = inject(MatDialogRef<PasswordResetDialogComponent>);

  readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);
  readonly snackBar = inject(MatSnackBar);

  readonly form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });

  async onSubmit(): Promise<void> {
    try {
      if (!this.form.valid) return;

      await firstValueFrom(
        this.authService.resetPassword({
          email: this.form.value.email!,
          redirectTo: `${window.location.origin}/auth/reset-password`
        })
      );
      this.snackBar.open('Password reset mail message successfully sent to your email', 'Close', {duration: 5000});
      this.dialogRef.close();
    } catch (err) {
      this.snackBar.open('Could not send recovery link, please check your email.', 'Close', {duration: 2000});
      this.form.reset();
    }
  }
}
