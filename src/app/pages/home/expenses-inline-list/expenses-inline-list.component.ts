import {Component, computed, inject, signal} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { CurrentExpensesService } from '@common/services/expenses/current-expenses.service';
import { ExpenseForDay } from '@common/models/current-expenses.model';
import { toSignal } from '@angular/core/rxjs-interop';
import {MatDialog} from '@angular/material/dialog';
import {
  ActualExpenseDialogComponent,
  ActualExpenseDialogParams
} from '../actual-expense-dialog/actual-expense-dialog.component';
import {firstValueFrom} from 'rxjs';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {LoadingComponent} from '@components/loading';

@Component({
  selector: 'app-expenses-inline-list',
  templateUrl: './expenses-inline-list.component.html',
  styleUrls: ['./expenses-inline-list.component.scss'],
  imports: [
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatSlideToggle,
    LoadingComponent
  ],
})
export class ExpensesInlineListComponent {
  readonly currentExpensesService = inject(CurrentExpensesService);
  readonly dialog = inject(MatDialog);
  readonly skeleton = Array.from({length: 10}, () => ['100%', '64px']) as [string, string][];

  readonly showPrevious = signal(false);

  readonly currentExpenses = toSignal(this.currentExpensesService.currentExpenses$);
  readonly currentExpensesPrepared = computed(() =>
    (this.currentExpenses()?.expenses ?? [])
      .filter(e => this.showPrevious() ? e : !e.isPreviousDay)
  );

  async startEditing(expense: ExpenseForDay): Promise<void> {
    const dialogRef = this.dialog.open(ActualExpenseDialogComponent, {
      data: <ActualExpenseDialogParams>{ expense }
    });

    const changed = await firstValueFrom(dialogRef.afterClosed()) as boolean;

    if (changed) {
      this.currentExpensesService.reloadExpenses();
    }
  }
}
