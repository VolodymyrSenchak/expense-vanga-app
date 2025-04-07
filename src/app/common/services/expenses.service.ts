import { Injectable } from "@angular/core";
import {ExpectedExpensesModel, getDefaultExpectedExpensesModel} from "@common/models";
import {map, Observable, of, switchMap} from "rxjs";
import {ActualExpenseModel, ActualExpensesModel, getDefaultActualExpensesModel} from '../models/actual-expenses.model';

@Injectable({ providedIn: 'root' })
export class ExpensesService {
  getExpectedExpenses$(): Observable<ExpectedExpensesModel> {
    return of(
      this.getFromLocalStorage<ExpectedExpensesModel>('expected-expenses') ?? getDefaultExpectedExpensesModel()
    );
  }

  saveExpectedExpenses$(expenses: ExpectedExpensesModel): Observable<boolean> {
    this.saveToLocalStorage('expected-expenses', expenses);
    return of(true);
  }

  getActualExpenses$(): Observable<ActualExpensesModel> {
    return of(
      this.getFromLocalStorage<ActualExpensesModel>('actual-expenses') ?? getDefaultActualExpensesModel()
    );
  }

  addActualExpense$(value: ActualExpenseModel): Observable<boolean> {
    return this.getActualExpenses$().pipe(
      map(existing => {
        const expenses = [...existing.expenses.filter(e => e.date !== value.date), value];
        return { ...existing, expenses };
      }),
      switchMap(edited => this.saveActualExpenses$(edited))
    );
  }

  saveActualExpenses$(expenses: ActualExpensesModel): Observable<boolean> {
    this.saveToLocalStorage('actual-expenses', expenses);
    return of(true);
  }

  private getFromLocalStorage<T>(key: string): T {
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data) as T;
    } else {
      return undefined!;
    }
  }

  private saveToLocalStorage<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
