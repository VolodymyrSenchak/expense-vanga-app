import {Component, inject} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {MatTableModule} from '@angular/material/table';
import {CurrentExpensesService} from '@common/services/current-expenses.service';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {ExpenseForDay} from '@common/models/current-expenses.model';
import {MatDialog} from '@angular/material/dialog';
import {
  ActualExpenseDialogComponent,
  ActualExpenseDialogParams
} from '../actual-expense-dialog/actual-expense-dialog.component';
import {BehaviorSubject, firstValueFrom, startWith, Subject, switchMap} from 'rxjs';

@Component({
  selector: 'app-expenses-list',
  imports: [
    MatTableModule,
    MatIconButton,
    MatIcon,
  ],
  templateUrl: './expenses-list.component.html',
  styleUrl: './expenses-list.component.scss'
})
export class ExpensesListComponent {
  readonly currentExpensesService = inject(CurrentExpensesService);
  readonly dialog = inject(MatDialog);

  readonly columnsToDisplay: Array<keyof ExpenseForDay> = [
    'dateFormatted', 'expectedAmountLeft', 'expectedExpenseAmount', 'actualAmountLeft', 'actualExpenseAmount'
  ];

  readonly currentExpenses = toSignal(this.currentExpensesService.currentExpenses$);

  async openActualResultDialog(expense: ExpenseForDay): Promise<void> {
    const dialogRef = this.dialog.open(ActualExpenseDialogComponent, {
      data: <ActualExpenseDialogParams>{
        date: expense.date,
        existingActualExpense: expense.actualExpense
      }
    });

    const changed = await firstValueFrom(dialogRef.afterClosed()) as boolean;

    if (changed) this.currentExpensesService.reloadExpenses();
  }
}
