import {Component, inject} from '@angular/core';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogContent, MatDialogRef, MatDialogTitle} from "@angular/material/dialog";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {ActualExpenseDialogParams} from '../../../pages/home/actual-expense-dialog/actual-expense-dialog.component';
import {AuthService, DialogManager} from '@common/services';
import {MatError} from '@angular/material/form-field';
import {MatButton} from '@angular/material/button';
import {firstValueFrom} from 'rxjs';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-register-dialog',
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
  templateUrl: './register-dialog.component.html',
  styleUrl: './register-dialog.component.scss'
})
export class RegisterDialogComponent {
  readonly dialogRef = inject(MatDialogRef<RegisterDialogComponent>);
  readonly data = inject<ActualExpenseDialogParams>(MAT_DIALOG_DATA);

  readonly fb = inject(FormBuilder);
  readonly dialogManager = inject(DialogManager);
  readonly authService = inject(AuthService);
  readonly snackBar = inject(MatSnackBar);

  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async onRegister(): Promise<void> {
    try {
      if (!this.loginForm.valid) return;

      await firstValueFrom(
        this.authService.register({
          email: this.loginForm.value.email!,
          password: this.loginForm.value.password!,
        }));
    } catch (err) {
      this.snackBar.open('Registration failed. Please try again.', 'Close', {
        duration: 3000,
      });
    }
  }

  backToLogin(): void {
    this.dialogRef.close();
    this.dialogManager.openDialog('auth-form', {});
  }
}
