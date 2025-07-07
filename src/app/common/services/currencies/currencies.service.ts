import {inject, Injectable} from '@angular/core';
import {AuthStore} from '@common/services';
import {MatSnackBar} from '@angular/material/snack-bar';
import {firstValueFrom, map, Observable, tap} from 'rxjs';
import {CurrenciesModel, ExpectedExpensesModel } from '@common/models';
import {CurrenciesLocalProvider} from './currencies-local-provider.service';
import {CurrenciesApiProvider} from './currencies-api-provider.service';

@Injectable({ providedIn: 'root' })
export class CurrenciesService {
  private readonly authStore = inject(AuthStore);
  private readonly localProvider = inject(CurrenciesLocalProvider);
  private readonly apiProvider = inject(CurrenciesApiProvider);
  private readonly snackBar = inject(MatSnackBar);

  private isCurrenciesLoaded = false;

  getCurrencies$(): Observable<CurrenciesModel> {
    if (this.isApiMode() && !this.isCurrenciesLoaded) {
      return this.apiProvider.getCurrencies$().pipe(
        map(currencies => currencies ?? this.getDefaultCurrencies()),
        tap(() => this.isCurrenciesLoaded = true),
        tap((currencies) => this.localProvider.saveCurrencies$(currencies)),
      );
    } else {
      return this.localProvider.getCurrencies$().pipe(
        map(currencies => currencies ?? this.getDefaultCurrencies()),
      );
    }
  }

  saveCurrencies$(currencies: CurrenciesModel): Observable<boolean> {
    return this.localProvider.saveCurrencies$(currencies).pipe(
      tap(async () => {
        if (this.isApiMode()) {
          this.showNotification('Saving currencies...');
          await firstValueFrom(this.apiProvider.saveCurrencies$(currencies));
        }
      })
    );
  }

  private getDefaultCurrencies(): CurrenciesModel {
    return { currencies: [], defaultCurrency: 'USD' };
  }

  private isApiMode(): boolean {
    return !!this.authStore.getSession()?.access_token;
  }

  private showNotification(message: string): void {
    this.snackBar.open(message, '', {
      horizontalPosition: 'right',
      duration: 1000,
    });
  }
}
