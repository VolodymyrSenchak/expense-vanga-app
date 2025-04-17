import { Component, inject, linkedSignal, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { Router, RouterLink } from "@angular/router";
import {ExpensesService, LoadingService} from "../../common/services";
import { toSignal } from "@angular/core/rxjs-interop";
import { firstValueFrom, from } from "rxjs";
import { DayOfWeek, ExpectedExpensesModel, getDefaultExpectedExpensesModel } from "../../common/models";
import {FormControl, ReactiveFormsModule, FormBuilder, Validators, FormGroup, UntypedFormGroup} from '@angular/forms';
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatCardModule } from "@angular/material/card";
import {LoadingComponent} from '../../components/loading';

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
    mainEarning: [0, [Validators.required, Validators.min(0)]],
    salaryDayOfMonth: [0, [Validators.required, Validators.min(1), Validators.max(31)]],
    dailyExpenses: this.formBuilder.array<UntypedFormGroup>([]),
    weeklyExpenses: this.formBuilder.array<UntypedFormGroup>([]),
  });

  async ngOnInit(): Promise<void> {
    const expectedExpenses = (await this.loadingSrv.waitObservable(this.expensesService.getExpectedExpenses$()))
      ?? getDefaultExpectedExpensesModel();

    this.form.patchValue({
      name: expectedExpenses.name,
      mainEarning: expectedExpenses.mainEarning,
      salaryDayOfMonth: expectedExpenses.salaryDayOfMonth
    });

    this.form.controls.weeklyExpenses.clear();
    this.form.controls.dailyExpenses.clear();

    expectedExpenses.weeklyExpenses.forEach(we => this.addWeeklyExpense(we.dayOfWeek, we.amount));
    expectedExpenses.dailyExpenses.forEach(de => this.addDailyExpense(de.dayOfMonth, de.amount, de.comment));
  }

  getDayOfWeek(weeklyExpense: FormGroup): string {
    return DayOfWeek[(weeklyExpense.controls as any).dayOfWeek.value!];
  }

  addDailyExpense(day: number = 1, amount: number = 0, comment: string = ''): void {
    this.form.controls.dailyExpenses.push(this.formBuilder.group({
      dayOfMonth: [day, [Validators.required, Validators.min(1), Validators.max(31)]],
      amount: [amount, [Validators.required, Validators.min(0)]],
      comment: [comment]
    }) as any);
  }

  removeDailyExpense(index: number): void {
    this.form.controls.dailyExpenses.removeAt(index);
  }

  addWeeklyExpense(day: DayOfWeek, amount: number): void {
    this.form.controls.weeklyExpenses.push(this.formBuilder.group({
      dayOfWeek: [day, Validators.required],
      amount: [amount, [Validators.required, Validators.min(0)]]
    }) as any);
  }

  async submitForm(): Promise<void> {
    if (this.form.valid) {
      const model = this.form.value as ExpectedExpensesModel;
      await this.loadingSrv.waitObservable(this.expensesService.saveExpectedExpenses$(model), "Saving...");
      await this.router.navigateByUrl('/');
    }
  }
}
