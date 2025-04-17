import {Component, inject, signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {MatTableModule} from '@angular/material/table';
import {CurrentExpensesService} from '@common/services/expenses/current-expenses.service';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {ExpenseForDay} from '@common/models/current-expenses.model';
import {MatDialog} from '@angular/material/dialog';
import {
  ActualExpenseDialogComponent,
  ActualExpenseDialogParams
} from '../actual-expense-dialog/actual-expense-dialog.component';
import { firstValueFrom } from 'rxjs';
import {LoadingComponent} from '../../../components/loading';

@Component({
  selector: 'app-expenses-list',
  imports: [
    MatTableModule,
    MatIconButton,
    MatIcon,
    LoadingComponent,
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
  readonly affectedExpenseDate = signal<string>('');

  async openActualResultDialog(expense: ExpenseForDay): Promise<void> {
    const dialogRef = this.dialog.open(ActualExpenseDialogComponent, {
      data: <ActualExpenseDialogParams>{
        date: expense.date,
        existingActualExpense: expense.actualExpense
      }
    });

    const changed = await firstValueFrom(dialogRef.afterClosed()) as boolean;

    if (changed) {
      this.currentExpensesService.reloadExpenses();
      this.highlightRow(expense.date);
    }
  }

  private highlightRow(date: string): void {
    this.affectedExpenseDate.set(date);
    setTimeout(() => {
      this.affectedExpenseDate.set('');
    }, 1000);
  }
}
