import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogContent, MatDialogRef, MatDialogTitle} from "@angular/material/dialog";
import {MatButton} from '@angular/material/button';
import {ActualExpenseDialogParams} from '../../../pages/home/actual-expense-dialog/actual-expense-dialog.component';
import { AuthStore } from '@common/services';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-user-profile-dialog',
  imports: [
    MatButton,
    MatDialogContent,
    MatDialogTitle
  ],
  templateUrl: './user-profile-dialog.component.html',
  styleUrl: './user-profile-dialog.component.scss'
})
export class UserProfileDialogComponent {
  readonly dialogRef = inject(MatDialogRef<UserProfileDialogComponent>);
  readonly data = inject<ActualExpenseDialogParams>(MAT_DIALOG_DATA);

  readonly authStore = inject(AuthStore);
  readonly user = toSignal(this.authStore.user$);

  onLogout(): void {
    this.authStore.clearAuth();
    this.dialogRef.close();
  }
}
