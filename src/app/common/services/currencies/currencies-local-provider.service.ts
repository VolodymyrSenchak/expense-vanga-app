import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {CurrenciesModel, SavingsModel} from '@common/models';
import {getFromLocalStorage, saveToLocalStorage} from '@common/utils/localStorage.utils';

@Injectable({ providedIn: 'root' })
export class CurrenciesLocalProvider {
  getCurrencies$(): Observable<CurrenciesModel> {
    return of(getFromLocalStorage<CurrenciesModel>('currencies'));
  }

  saveCurrencies$(curencies: CurrenciesModel): Observable<boolean> {
    saveToLocalStorage('currencies', curencies);
    return of(true);
  }
}
