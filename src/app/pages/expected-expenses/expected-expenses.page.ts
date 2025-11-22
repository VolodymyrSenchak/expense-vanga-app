import { Component, inject, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { Router, RouterLink } from "@angular/router";
import { ExpensesService, LoadingService} from "../../common/services";
import { DayOfWeek, ExpectedExpensesModel, getDefaultExpectedExpensesModel } from "../../common/models";
import {ReactiveFormsModule, FormBuilder, Validators, FormGroup, UntypedFormGroup, FormArray} from '@angular/forms';
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatCardModule } from "@angular/material/card";
import { LoadingComponent} from '../../components/loading';

@Component({
  selector: 'app-expected-expenses-page',
  imports: [
    MatIconModule,
    MatButtonModule,
    RouterLink,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatCardModule,
    LoadingComponent
  ],
  templateUrl: './expected-expenses.page.html',
})
export class ExpectedExpensesPageComponent implements OnInit {
  readonly expensesService = inject(ExpensesService);
  readonly formBuilder = inject(FormBuilder);
  readonly router = inject(Router);
  readonly loadingSrv = new LoadingService();

  readonly form = this.formBuilder.group({
    name: [''],
    salaryDayOfMonth: [0, [Validators.required, Validators.min(1), Validators.max(31)]],
    earnings: this.formBuilder.array<UntypedFormGroup>([]),
    dailyExpenses: this.formBuilder.array<UntypedFormGroup>([]),
    weeklyExpenses: this.formBuilder.array<UntypedFormGroup>([]),
  });

  async ngOnInit(): Promise<void> {
    const expectedExpenses = (await this.loadingSrv.waitObservable(this.expensesService.getExpectedExpenses$()))
      ?? getDefaultExpectedExpensesModel();

    this.form.patchValue({
      name: expectedExpenses.name,
      salaryDayOfMonth: expectedExpenses.salaryDayOfMonth
    });

    this.form.controls.earnings.clear();
    this.form.controls.weeklyExpenses.clear();
    this.form.controls.dailyExpenses.clear();

    const earnings = expectedExpenses.earnings || [
      { name: 'Zloti', amount: expectedExpenses.mainEarning, currency: 'PLN' }
    ];

    earnings.forEach(e => this.addEarning(e.name, e.amount, e.currency));
    (expectedExpenses.weeklyExpenses || []).forEach(we => this.addWeeklyExpense(we.dayOfWeek, we.amount));
    (expectedExpenses.dailyExpenses || []).forEach(de => this.addDailyExpense(de.dayOfMonth, de.amount, de.comment));
  }

  getDayOfWeek(weeklyExpense: FormGroup): string {
    return DayOfWeek[(weeklyExpense.controls as any).dayOfWeek.value!];
  }

  addEarning(name: string = '', amount: number = 0, currency: string = ''): void {
    this.form.controls.earnings.push(this.formBuilder.group({
      name: [name, [Validators.required, Validators.min(1), Validators.max(31)]],
      amount: [amount, [Validators.required, Validators.min(0)]],
      currency: [currency, [Validators.required]]
    }) as any);
  }

  addDailyExpense(day: number = 1, amount: number = 0, comment: string = ''): void {
    this.form.controls.dailyExpenses.push(this.formBuilder.group({
      dayOfMonth: [day, [Validators.required, Validators.min(1), Validators.max(31)]],
      amount: [amount, [Validators.required]],
      comment: [comment]
    }) as any);
  }

  addWeeklyExpense(day: DayOfWeek, amount: number): void {
    this.form.controls.weeklyExpenses.push(this.formBuilder.group({
      dayOfWeek: [day, Validators.required],
      amount: [amount, [Validators.required, Validators.min(0)]]
    }) as any);
  }

  removeDailyExpense(index: number): void {
    this.form.controls.dailyExpenses.removeAt(index);
  }

  removeEarning(index: number): void {
    this.form.controls.earnings.removeAt(index);
  }

  async submitForm(): Promise<void> {
    if (this.form.valid) {
      const formValue = this.form.value as ExpectedExpensesModel;
      const model: ExpectedExpensesModel = {
        ...formValue,
        dailyExpenses: formValue.dailyExpenses.sort((a, b) => a.dayOfMonth - b.dayOfMonth),
      };
      await this.loadingSrv.waitObservable(this.expensesService.saveExpectedExpenses$(model), "Saving...");
      await this.router.navigateByUrl('/');
    }
  }
}
