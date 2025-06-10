import {Component, inject} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppHeader } from './layout/app-header/app-header.component';
import {MatDialog} from '@angular/material/dialog';
import {DialogManager, DialogType} from '@common/services';
import {AuthDialogComponent, RegisterDialogComponent, PasswordResetDialogComponent} from './dialogs/auth';
import {UserProfileDialogComponent} from './layout/user-profile/user-profile-dialog';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppHeader],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  readonly dialog = inject(MatDialog);
  readonly dialogManager = inject(DialogManager);

  constructor() {
    this.dialogManager.currentDialog$.subscribe(dialog => {
      const dialogInstance = this.getDialogInstance(dialog.dialogType);
      if (dialogInstance) {
        this.dialog.open(dialogInstance, {data: dialog.params });
      }
    });
  }

  private getDialogInstance(type: DialogType): any  {
    switch (type) {
      case "auth-form": return AuthDialogComponent;
      case "register-form": return RegisterDialogComponent;
      case "user-profile": return UserProfileDialogComponent;
      case "password-reset-dialog": return PasswordResetDialogComponent;
      default: return null;
    }
  }
}
