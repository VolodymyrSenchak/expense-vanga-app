import {Injectable} from '@angular/core';
import {ExpensesService} from './expenses.service';
import {BehaviorSubject, combineLatest, map, Observable, shareReplay, switchMap} from 'rxjs';
import {CurrentExpensesModel, ExpenseForDay} from '../../models/current-expenses.model';
import {ExpectedExpensesModel} from '../../models';
import {ActualExpensesModel} from '../../models/actual-expenses.model';
import {DATE_UTILS} from '../../utils/date.utils';

@Injectable({ providedIn: 'root' })
export class CurrentExpensesService {
  constructor(private readonly expensesService: ExpensesService) {}

  private readonly expensesLoadSub = new BehaviorSubject<boolean>(true);
  readonly currentExpenses$ = this.expensesLoadSub.pipe(
    switchMap(() => this.getCurrentExpenses$(new Date())),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  reloadExpenses(): void {
    this.expensesLoadSub.next(true);
  }

  private getCurrentExpenses$(forDate: Date): Observable<CurrentExpensesModel> {
    return combineLatest([
      this.expensesService.getExpectedExpenses$(),
      this.expensesService.getActualExpenses$()
    ]).pipe(
      map(([expected, actual]) => this.buildCurrentExpenses(forDate, expected, actual))
    )
  }

  private buildCurrentExpenses(
    forDate: Date,
    expectedExpenses: ExpectedExpensesModel,
    actualExpenses: ActualExpensesModel
  ): CurrentExpensesModel {
    const expensesForDay: ExpenseForDay[] = [];
    let expectedAmountLeft = expectedExpenses.mainEarning;
    let actualAmountLeft = expectedExpenses.mainEarning;

    for (const date of this.getDatesBetweenSalary(forDate, expectedExpenses.salaryDayOfMonth)) {
      const actualExpense = actualExpenses.expenses.find(d => DATE_UTILS.isSame(d.date, date));
      const weeklyExpectedExpense = expectedExpenses.weeklyExpenses.find(w => DATE_UTILS.isDayOfWeek(date, w.dayOfWeek));
      const dailyExpectedExpense = expectedExpenses.dailyExpenses.find(w => w.dayOfMonth === date.getDate());
      // Maybe in the future it would be nice to add, if daily expense overrides or adds amount to weekly expense
      const expectedExpense = ((weeklyExpectedExpense?.amount ?? 0) * (expectedExpenses.weeklyExpenseCoefficient ?? 1))
        + (dailyExpectedExpense?.amount ?? 0);
      const actualExpenseAmount = !actualExpense
        ? expectedExpense
        : actualExpense.isOverridingExpected ? actualExpense.amount : actualExpense.amount + expectedExpense;

      expectedAmountLeft = expectedAmountLeft - expectedExpense;
      actualAmountLeft = actualAmountLeft - actualExpenseAmount;

      expensesForDay.push({
        date: DATE_UTILS.format(date, 'date'),
        dateFormatted: DATE_UTILS.format(date, 'month-day'),
        actualExpenseAmount: actualExpenseAmount,
        expectedExpenseAmount: expectedExpense,
        expectedDailyComment: dailyExpectedExpense?.comment,
        actualDailyComment: actualExpense?.comment,
        expectedAmountLeft,
        actualAmountLeft,
        actualExpense: actualExpense,
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        isPreviousDay: DATE_UTILS.isBefore(date, forDate),
        isToday: DATE_UTILS.isSame(date, forDate)
      });
    }

    return { expenses: expensesForDay };
  }

  private getDatesBetweenSalary(date: Date, salaryDay: number): Date[] {
    const dates: Date[] = [];
    date = date.getDate() < salaryDay ? DATE_UTILS.add(date, -1, 'month')  : date;
    let current = new Date(date.getFullYear(), date.getMonth(), salaryDay);
    dates.push(current);

    do {
      current = DATE_UTILS.add(current, 1, 'day');
      dates.push(current);
    } while (current.getDate() !== salaryDay);

    return dates;
  }
}
