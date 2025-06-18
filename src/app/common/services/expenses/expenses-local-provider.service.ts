import {Injectable} from '@angular/core';
import {map, Observable, of, switchMap} from 'rxjs';
import {CurrentMoneyAmountModel, ExpectedExpensesModel} from '@common/models';
import {getFromLocalStorage, saveToLocalStorage} from '@common/utils/localStorage.utils';
import {ActualExpenseModel, ActualExpensesModel} from '@common/models/actual-expenses.model';

@Injectable({ providedIn: 'root' })
export class ExpensesLocalProvider {
  getExpectedExpenses$(): Observable<ExpectedExpensesModel> {
    return of(getFromLocalStorage<ExpectedExpensesModel>('expected-expenses'));
  }

  saveExpectedExpenses$(expenses: ExpectedExpensesModel): Observable<boolean> {
    saveToLocalStorage('expected-expenses', expenses);
    return of(true);
  }

  getActualExpenses$(): Observable<ActualExpensesModel> {
    return of(getFromLocalStorage<ActualExpensesModel>('actual-expenses'));
  }

  getCurrentMoneyAmount$(): Observable<CurrentMoneyAmountModel> {
    return of(getFromLocalStorage<CurrentMoneyAmountModel>('current-money'));
  }

  saveCurrentMoneyAmount$(money: CurrentMoneyAmountModel): Observable<boolean> {
    saveToLocalStorage('current-money', money);
    return of(true);
  }

  addActualExpense$(value: ActualExpenseModel): Observable<boolean> {
    return this.getActualExpenses$().pipe(
      map(existing => {
        const existingExpenses = existing?.expenses || [];
        const expenses = [...existingExpenses.filter(e => e.date !== value.date), value];
        return { ...existing, expenses };
      }),
      switchMap(edited => this.saveActualExpenses$(edited))
    );
  }

  deleteActualExpense$(forDate: string): Observable<boolean> {
    return this.getActualExpenses$().pipe(
      map(existing => ({ ...existing, expenses: existing.expenses.filter(e => e.date !== forDate) })),
      switchMap(edited => this.saveActualExpenses$(edited))
    );
  }

  saveActualExpenses$(expenses: ActualExpensesModel): Observable<boolean> {
    saveToLocalStorage('actual-expenses', expenses);
    return of(true);
  }
}
