import {Component, inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {ActualExpenseDialogParams} from '../../pages/home/actual-expense-dialog/actual-expense-dialog.component';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatFormField, MatInput, MatLabel} from '@angular/material/input';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatError} from '@angular/material/form-field';
import {AuthStore} from '@common/services';

@Component({
  selector: 'app-auth-dialog',
  imports: [
    MatButton,
    //MatDialogActions,
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

  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onLogin(): void {
    if (this.loginForm.valid) {
      console.log('Form Submitted', this.loginForm.value);
    } else {
      console.log('Form is invalid');
    }
  }

  onContinueLocally(): void {
    this.authStore.clearAuth();
    this.dialogRef.close();
  }
}
