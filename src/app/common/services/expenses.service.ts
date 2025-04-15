import { Injectable } from "@angular/core";
import {ExpectedExpensesModel, getDefaultExpectedExpensesModel} from "@common/models";
import {map, Observable, of, switchMap} from "rxjs";
import {ActualExpenseModel, ActualExpensesModel, getDefaultActualExpensesModel} from '../models/actual-expenses.model';
import {getFromLocalStorage, saveToLocalStorage} from '@common/utils/localStorage.utils';

@Injectable({ providedIn: 'root' })
export class ExpensesService {
  getExpectedExpenses$(): Observable<ExpectedExpensesModel> {
    return of(
      getFromLocalStorage<ExpectedExpensesModel>('expected-expenses') ?? getDefaultExpectedExpensesModel()
    );
  }

  saveExpectedExpenses$(expenses: ExpectedExpensesModel): Observable<boolean> {
    saveToLocalStorage('expected-expenses', expenses);
    return of(true);
  }

  getActualExpenses$(): Observable<ActualExpensesModel> {
    return of(
      getFromLocalStorage<ActualExpensesModel>('actual-expenses') ?? getDefaultActualExpensesModel()
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
