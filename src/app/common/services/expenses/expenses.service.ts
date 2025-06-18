import {inject, Injectable} from "@angular/core";
import {CurrentMoneyAmountModel, ExpectedExpensesModel, getDefaultExpectedExpensesModel} from "@common/models";
import {firstValueFrom, map, Observable, of, tap} from "rxjs";
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
  private isCurrentMoneyAmountLoaded = false;

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

  getCurrentMoneyAmount$(): Observable<CurrentMoneyAmountModel> {
    // TODO: when api is ready, remove false
    if (this.isApiMode() && !this.isCurrentMoneyAmountLoaded && false) {
      return this.apiProvider.getCurrentMoneyAmount$().pipe(
        map(money => money ?? { money: [] }),
        tap(() => this.isCurrentMoneyAmountLoaded = true),
        tap((money) => this.localProvider.saveCurrentMoneyAmount$(money)),
      );
    } else {
      return this.localProvider.getCurrentMoneyAmount$().pipe(
        map(expenses => expenses ?? { money: [] }),
      );
    }
  }

  saveCurrentMoneyAmount$(money: CurrentMoneyAmountModel): Observable<boolean> {
    return this.localProvider.saveCurrentMoneyAmount$(money).pipe(
      tap(async () => {
        // TODO: when api is ready, remove false
        if (this.isApiMode() && false) {
          this.showNotification('Saving current money amount...');
          await firstValueFrom(this.apiProvider.saveCurrentMoneyAmount$(money));
        }
      })
    );
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
