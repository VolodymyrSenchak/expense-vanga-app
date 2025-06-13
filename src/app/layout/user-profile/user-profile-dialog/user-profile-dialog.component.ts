import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogContent, MatDialogRef, MatDialogTitle} from "@angular/material/dialog";
import {MatButton} from '@angular/material/button';
import {ActualExpenseDialogParams} from '../../../pages/home/actual-expense-dialog/actual-expense-dialog.component';
import { AuthStore, DialogManager } from '@common/services';
import {toSignal} from '@angular/core/rxjs-interop';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-user-profile-dialog',
  imports: [
    MatButton,
    MatDialogContent,
    MatDialogTitle,
    MatDividerModule
  ],
  templateUrl: './user-profile-dialog.component.html',
  styleUrl: './user-profile-dialog.component.scss'
})
export class UserProfileDialogComponent {
  readonly dialogRef = inject(MatDialogRef<UserProfileDialogComponent>);
  readonly data = inject<ActualExpenseDialogParams>(MAT_DIALOG_DATA);
  readonly dialogManager = inject(DialogManager);

  readonly authStore = inject(AuthStore);
  readonly user = toSignal(this.authStore.user$);

  changePassword(): void {
    this.dialogManager.openDialog("password-change-dialog", {});
    this.dialogRef.close();
  }

  onLogout(): void {
    this.authStore.clearAuth();
    this.dialogRef.close();
  }
}
