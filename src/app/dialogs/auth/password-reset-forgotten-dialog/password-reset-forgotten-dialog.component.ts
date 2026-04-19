import { Component, inject } from "@angular/core";
import { FormBuilder, Validators, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, AbstractControl } from "@angular/forms";
import { MatButton } from "@angular/material/button";
import { MatDialogContent, MatDialogRef, MatDialogTitle } from "@angular/material/dialog";
import { MatError, MatFormField, MatInput, MatLabel } from "@angular/material/input";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService, DialogManager } from "@common/services";
import { firstValueFrom } from "rxjs";
import { Router } from "@angular/router";

@Component({
  selector: 'app-password-reset-forgotten-dialog',
  imports: [
    FormsModule,
    MatDialogContent,
    MatDialogTitle,
    MatButton,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    MatFormField,
    MatError
  ],
  templateUrl: './password-reset-forgotten-dialog.component.html',
})
export class PasswordResetForgottenDialogComponent {
  readonly dialogRef = inject(MatDialogRef<PasswordResetForgottenDialogComponent>);

  readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);
  readonly snackBar = inject(MatSnackBar);
  readonly dialogManager = inject(DialogManager);
  readonly router = inject(Router);

  readonly passwordsMatchValidator: ValidatorFn = (control: AbstractControl) => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  };

  readonly form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
  }, { validators: this.passwordsMatchValidator });

  async onResetPassword(): Promise<void> {
    try {
      if (!this.form.valid) return;

      await firstValueFrom(
        this.authService.changePasswordForgotten({
          newPassword: this.form.value.password!,
        }));
      this.snackBar.open('Password reset successfully', 'Close', { duration: 3000 });
      this.dialogRef.close();
      await this.router.navigateByUrl('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password reset failed. Please try again.';
      this.snackBar.open(errorMessage, 'Close', {
        duration: 3000,
      });
    }
  }

  goBack(): void {
    this.dialogRef.close();
    this.router.navigateByUrl('/');
  }
}
