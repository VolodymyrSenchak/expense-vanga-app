import {Component, inject} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppHeader } from './layout/app-header/app-header.component';
import {MatDialog} from '@angular/material/dialog';
import {DialogManager, DialogType} from '@common/services';
import {AuthDialogComponent} from './dialogs/auth';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    AppHeader,
  ],
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

  private getDialogInstance(type: DialogType)  {
    switch (type) {
      case "auth-form": return AuthDialogComponent; // change to login dialog
      default: return null;
    }
  }
}
