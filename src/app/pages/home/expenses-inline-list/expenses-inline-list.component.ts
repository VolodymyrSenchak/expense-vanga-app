import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { CurrentExpensesService } from '@common/services/expenses/current-expenses.service';
import { ExpenseForDay } from '@common/models/current-expenses.model';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-expenses-inline-list',
  templateUrl: './expenses-inline-list.component.html',
  styleUrls: ['./expenses-inline-list.component.scss'],
  imports: [
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
})
export class ExpensesInlineListComponent {
  readonly currentExpensesService = inject(CurrentExpensesService);
  readonly formBuilder = inject(FormBuilder);

  readonly currentExpenses = toSignal(this.currentExpensesService.currentExpenses$);

  editForm: FormGroup = this.formBuilder.group({
    amount: [''],
  });

  readonly amountControl = this.editForm.get('amount') as FormControl;

  editingExpense: ExpenseForDay | null = null;

  startEditing(expense: ExpenseForDay): void {
    this.editingExpense = expense;
    this.editForm.patchValue({ amount: expense.actualExpenseAmount });
  }

  saveEdit(): void {
    if (this.editingExpense) {
      const updatedAmount = this.editForm.value.amount;
      // Call service to update the actual expense amount
      this.editingExpense.actualExpenseAmount = updatedAmount;
      this.editingExpense = null;
    }
  }

  cancelEdit(): void {
    this.editingExpense = null;
  }
}