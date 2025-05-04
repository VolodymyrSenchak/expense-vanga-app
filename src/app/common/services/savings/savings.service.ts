import {inject, Injectable} from '@angular/core';
import {AuthStore} from '@common/services';
import {MatSnackBar} from '@angular/material/snack-bar';
import {firstValueFrom, map, Observable, tap} from 'rxjs';
import {SavingsModel} from '@common/models';
import {SavingsLocalProvider} from './savings-local-provider.service';
import {SavingsApiProvider} from './savings-api-provider.service';

@Injectable({ providedIn: 'root' })
export class SavingsService {
  private readonly authStore = inject(AuthStore);
  private readonly localProvider = inject(SavingsLocalProvider);
  private readonly apiProvider = inject(SavingsApiProvider);
  private readonly snackBar = inject(MatSnackBar);

  getSavings$(): Observable<SavingsModel> {
    if (this.isApiMode()) {
      return this.apiProvider.getSavings().pipe(
        map(savings => savings ?? this.getDefaultSavingsModel()),
        tap((savings) => this.localProvider.saveSavings(savings)),
      );
    } else {
      return this.localProvider.getSavings().pipe(
        map(expenses => expenses ?? this.getDefaultSavingsModel()),
      );
    }
  }

  saveSavings$(savings: SavingsModel): Observable<boolean> {
    return this.localProvider.saveSavings(savings).pipe(
      tap(async () => {
        if (this.isApiMode()) {
          this.showNotification('Saving savings...');
          await firstValueFrom(this.apiProvider.saveSavings(savings));
        }
      })
    );
  }

  private getDefaultSavingsModel(): SavingsModel {
    return { savings: [], currencies: [], defaultCurrency: 'USD' };
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
