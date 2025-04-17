import {inject, Injectable} from "@angular/core";
import {ExpectedExpensesModel, getDefaultExpectedExpensesModel} from "@common/models";
import {firstValueFrom, map, Observable, tap} from "rxjs";
import {ActualExpenseModel, ActualExpensesModel, getDefaultActualExpensesModel} from '../../models/actual-expenses.model';
import {AuthStore} from '@common/services/auth.local-store';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ExpensesApiProvider} from './expenses-api-provider.service';
import {ExpensesLocalProvider} from './expenses-local-provider.service';

@Injectable({ providedIn: 'root' })
export class ExpensesService {
  private readonly authStore = inject(AuthStore);
  private readonly localProvider = inject(ExpensesLocalProvider);
  private readonly apiProvider = inject(ExpensesApiProvider);
  private readonly snackBar = inject(MatSnackBar);

  private isExpectedLoaded = false;
  private isActualLoaded = false;

  private isApiMode(): boolean {
    return !!this.authStore.getSession()?.access_token;
  }

  getExpectedExpenses$(): Observable<ExpectedExpensesModel> {
    if (this.isApiMode() && !this.isExpectedLoaded) {
      return this.apiProvider.getExpectedExpenses$().pipe(
        map(expenses => expenses ?? getDefaultExpectedExpensesModel()),
        tap(() => this.isExpectedLoaded = true),
        tap((expenses) => this.localProvider.saveExpectedExpenses$(expenses)),
      );
    } else {
      return this.localProvider.getExpectedExpenses$().pipe(
        map(expenses => expenses ?? getDefaultExpectedExpensesModel()),
      );
    }
  }

  getActualExpenses$(): Observable<ActualExpensesModel> {
    if (this.isApiMode() && !this.isActualLoaded) {
      return this.apiProvider.getActualExpenses$().pipe(
        map(expenses => expenses ?? getDefaultActualExpensesModel()),
        tap(() => this.isActualLoaded = true),
        tap((expenses) => this.localProvider.saveActualExpenses$(expenses)),
      );
    } else {
      return this.localProvider.getActualExpenses$().pipe(
        map(expenses => expenses ?? getDefaultActualExpensesModel()),
      );
    }
  }

  saveExpectedExpenses$(expenses: ExpectedExpensesModel): Observable<boolean> {
    return this.localProvider.saveExpectedExpenses$(expenses).pipe(
      tap(async () => {
        if (this.isApiMode()) {
            this.showNotification('Saving expected expenses...');
            await firstValueFrom(this.apiProvider.saveExpectedExpenses$(expenses));
        }
      })
    );
  }

  addActualExpense$(value: ActualExpenseModel): Observable<boolean> {
    return this.localProvider.addActualExpense$(value).pipe(
      tap(async () => {
        if (this.isApiMode()) {
          this.showNotification('Changing actual expense...');
          await firstValueFrom(this.apiProvider.addActualExpense$(value));
        }
      })
    );
  }

  deleteActualExpense$(forDate: string): Observable<boolean> {
    return this.localProvider.deleteActualExpense$(forDate).pipe(
      tap(async () => {
        if (this.isApiMode()) {
          this.showNotification('Changing actual expense...');
          await firstValueFrom(this.apiProvider.deleteActualExpense$(forDate));
        }
      })
    );
  }

  private showNotification(message: string): void {
    this.snackBar.open(message, '', {
      horizontalPosition: 'right',
      duration: 1000,
    });
  }
}
