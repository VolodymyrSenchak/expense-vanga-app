import {Component, inject, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppHeader } from './layout/app-header/app-header.component';
import {MatDialog} from '@angular/material/dialog';
import {CurrentExpensesService, DialogManager, DialogType, LoadingService} from '@common/services';
import {AuthDialogComponent, RegisterDialogComponent, PasswordResetDialogComponent, PasswordChangeDialogComponent} from './dialogs/auth';
import {UserProfileDialogComponent} from './layout/user-profile/user-profile-dialog';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppHeader],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  readonly dialog = inject(MatDialog);
  readonly dialogManager = inject(DialogManager);
  readonly loading = new LoadingService();
  readonly currentExpensesService = inject(CurrentExpensesService);

  async ngOnInit(): Promise<void> {
    await this.loading.waitObservable(this.currentExpensesService.currentExpenses$);
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
      case "password-change-dialog": return PasswordChangeDialogComponent;
      default: return null;
    }
  }
}
