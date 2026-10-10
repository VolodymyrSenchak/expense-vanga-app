import {Component, inject, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppHeader } from './layout/app-header/app-header.component';
import {MatDialog} from '@angular/material/dialog';
import {CurrentExpensesService, DialogManager, DialogType, LoadingService, UserSettingsStore} from '@common/services';
import {OnboardingDialogComponent} from './dialogs/onboarding';
import {AuthDialogComponent, RegisterDialogComponent, PasswordResetDialogComponent, PasswordChangeDialogComponent, PasswordResetForgottenDialogComponent} from './dialogs/auth';
import {UserProfileDialogComponent} from './layout/user-profile/user-profile-dialog';
import { ThemeService } from '@common/services/theme.service';

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
  readonly themeService = inject(ThemeService);
  readonly userSettingsStore = inject(UserSettingsStore);

  async ngOnInit(): Promise<void> {
    this.dialogManager.currentDialog$.subscribe(dialog => {
      const dialogInstance = this.getDialogInstance(dialog.dialogType);
      if (dialogInstance) {
        this.dialog.open(dialogInstance, {data: dialog.params });
      }
    });
    await this.loading.waitObservable(this.currentExpensesService.currentExpenses$);

    if (!this.userSettingsStore.getUserSettings().onboardingDone) {
      this.dialogManager.openDialog('onboarding', {});
    }
  }

  private getDialogInstance(type: DialogType): any  {
    switch (type) {
      case "auth-form": return AuthDialogComponent;
      case "register-form": return RegisterDialogComponent;
      case "user-profile": return UserProfileDialogComponent;
      case "password-reset-dialog": return PasswordResetDialogComponent;
      case "password-reset-forgotten-dialog": return PasswordResetForgottenDialogComponent;
      case "password-change-dialog": return PasswordChangeDialogComponent;
      case "onboarding": return OnboardingDialogComponent;
      default: return null;
    }
  }
}
