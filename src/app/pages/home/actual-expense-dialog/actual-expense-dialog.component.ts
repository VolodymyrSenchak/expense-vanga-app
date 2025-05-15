import {Component, inject, model} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {ExpensesService} from '@common/services';
import {firstValueFrom} from 'rxjs';
import {MatCheckbox} from '@angular/material/checkbox';
import {DATE_UTILS} from '@common/utils/date.utils';
import {ExpenseForDay} from '@common/models/current-expenses.model';

export interface ActualExpenseDialogParams {
  expense: ExpenseForDay;
}

@Component({
  selector: 'app-actual-expense-dialog',
  templateUrl: 'actual-expense-dialog.component.html',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatCheckbox,
    ReactiveFormsModule,
  ],
})
export class ActualExpenseDialogComponent {
  readonly expensesService = inject(ExpensesService);
  readonly dialogRef = inject(MatDialogRef<ActualExpenseDialogComponent>);
  readonly data = inject<ActualExpenseDialogParams>(MAT_DIALOG_DATA);

  readonly dateFormatted = DATE_UTILS.format(this.data.expense.date, 'month-day');
  readonly amount = model(this.data.expense.actualExpense?.amount);
  readonly comment = model(this.data.expense.actualExpense?.comment);
  readonly isOverridingExpected = model(this.data.expense.actualExpense?.isOverridingExpected ?? false);

  onCancel(): void {
    this.dialogRef.close(false);
  }

  async onRemove(): Promise<void> {
    await firstValueFrom(this.expensesService.deleteActualExpense$(this.data.expense.date));
    this.dialogRef.close(true);
  }

  async onConfirm(): Promise<void> {
    if (!this.amount() || this.amount() === 0) {
      await firstValueFrom(this.expensesService.deleteActualExpense$(this.data.expense.date));
    } else {
      await firstValueFrom(this.expensesService.addActualExpense$({
        date: this.data.expense.date,
        amount: this.amount() ?? 0,
        comment: this.comment() ?? '',
        isOverridingExpected: this.isOverridingExpected()
      }));
    }

    this.dialogRef.close(true);
  }
}
