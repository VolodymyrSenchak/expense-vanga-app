import { Component, inject, input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-daily-expenses-list',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './daily-expenses-list.component.html',
})
export class DailyExpensesListComponent {
  private readonly fb = inject(FormBuilder);

  readonly dailyExpenses = input.required<FormArray>();

  addDailyExpense(): void {
    this.dailyExpenses().push(this.fb.group({
      dayOfMonth: [1, [Validators.required, Validators.min(1), Validators.max(31)]],
      amount: [0, [Validators.required]],
      comment: [''],
    }) as any);
  }

  removeDailyExpense(index: number): void {
    this.dailyExpenses().removeAt(index);
  }

  getGroup(index: number): FormGroup {
    return this.dailyExpenses().at(index) as FormGroup;
  }
}
