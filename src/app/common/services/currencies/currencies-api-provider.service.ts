import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CurrenciesModel} from '@common/models';

@Injectable({ providedIn: 'root' })
export class CurrenciesApiProvider {
  private readonly http = inject(HttpClient);

  getCurrencies$(): Observable<CurrenciesModel> {
    return this.http.get<CurrenciesModel>(`currencies`);
  }

  saveCurrencies$(currencies: CurrenciesModel): Observable<boolean> {
    return this.http.post<boolean>(`currencies`, currencies);
  }
}
