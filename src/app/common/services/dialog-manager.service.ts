import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

export type DialogType =
  'auth-form'
  | 'register-form'
  | 'password-reset-dialog'
  | 'user-profile'
  | 'password-change-dialog'
  | 'unknown';

export interface DialogParams {
  dialogType: DialogType;
  params: unknown;
}

@Injectable({ providedIn: 'root' })
export class DialogManager {
  private readonly currentDialogSub = new Subject<DialogParams>();

  readonly currentDialog$ = this.currentDialogSub.asObservable();

  openDialog<T>(dialogType: DialogType, params: T): void {
    this.currentDialogSub.next({ dialogType, params });
  }
}
