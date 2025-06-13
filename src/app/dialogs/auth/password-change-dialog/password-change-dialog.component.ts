import { Component, inject } from "@angular/core";
import { FormBuilder, Validators, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, AbstractControl } from "@angular/forms";
import { MatButton } from "@angular/material/button";
import { MatDialogContent, MatDialogRef, MatDialogTitle } from "@angular/material/dialog";
import { MatError, MatFormField, MatInput, MatLabel } from "@angular/material/input";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService, DialogManager } from "@common/services";
import { firstValueFrom } from "rxjs";

@Component({
  selector: 'app-password-change-dialog',
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
  templateUrl: './password-change-dialog.component.html',
})
export class PasswordChangeDialogComponent {
  readonly dialogRef = inject(MatDialogRef<PasswordChangeDialogComponent>);

  readonly fb = inject(FormBuilder);
  readonly dialogManager = inject(DialogManager);
  readonly authService = inject(AuthService);
  readonly snackBar = inject(MatSnackBar);

  readonly passwordsMatchValidator: ValidatorFn = (control: AbstractControl) => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  };

  readonly form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
  }, { validators: this.passwordsMatchValidator });

  async onChangePassword(): Promise<void> {
    try {
      if (!this.form.valid) return;

      await firstValueFrom(
        this.authService.changePassword({
          password: this.form.value.password!,
        }));
      this.snackBar.open('Password changed successfully', 'Close', { duration: 3000 });
      this.backToUserProfile();
    } catch (err) {
      this.snackBar.open('Password changing failed. Please try again.', 'Close', {
        duration: 3000,
      });
    }
  }

  backToUserProfile(): void {
    this.dialogRef.close();
    this.dialogManager.openDialog("user-profile", {});
  }
}
