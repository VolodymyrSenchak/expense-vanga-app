import {Component, inject} from '@angular/core';
import {ExpensesActualizeDialogComponent} from '../expenses-actualize-dialog';
import {firstValueFrom} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import { MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-actualize-expenses-button',
  imports: [
    MatButtonModule
  ],
  templateUrl: './actualize-expenses-button.component.html',
})
export class ActualizeExpensesButtonComponent {
  readonly dialog = inject(MatDialog);

  async refreshExpenses(): Promise<void> {
    const dialogRef = this.dialog.open(ExpensesActualizeDialogComponent);
    await firstValueFrom(dialogRef.afterClosed());
  }
}
