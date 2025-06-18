import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {CurrentMoneyAmountModel, ExpectedExpensesModel} from '@common/models';
import {ActualExpenseModel, ActualExpensesModel} from '@common/models/actual-expenses.model';

@Injectable({ providedIn: 'root' })
export class ExpensesApiProvider {
  private readonly http = inject(HttpClient);

  getExpectedExpenses$(): Observable<ExpectedExpensesModel> {
    return this.http.get<ExpectedExpensesModel>(`expenses/expected`);
  }

  saveExpectedExpenses$(expenses: ExpectedExpensesModel): Observable<boolean> {
    return this.http.post<boolean>(`expenses/expected`, expenses);
  }

  getActualExpenses$(): Observable<ActualExpensesModel> {
    return this.http.get<ActualExpenseModel[]>(`expenses/actual`).pipe(map(expenses => ({ expenses })));
  }

  addActualExpense$(value: ActualExpenseModel): Observable<boolean> {
    return this.http.post<boolean>(`expenses/actual`, value);
  }

  deleteActualExpense$(forDate: string): Observable<boolean> {
    return this.http.delete<boolean>(`expenses/actual?date=${forDate}`);
  }

  getCurrentMoneyAmount$(): Observable<CurrentMoneyAmountModel> {
    return this.http.get<CurrentMoneyAmountModel>(`expenses/current-amount`);
  }

  saveCurrentMoneyAmount$(currentMoney: CurrentMoneyAmountModel): Observable<boolean> {
    return this.http.post<boolean>(`expenses/current-amount`, currentMoney);
  }
}
