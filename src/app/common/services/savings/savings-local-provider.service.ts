import { Injectable } from '@angular/core';
import {Observable, of} from 'rxjs';
import { SavingsModel} from '@common/models';
import {getFromLocalStorage, saveToLocalStorage} from '@common/utils/localStorage.utils';

@Injectable({ providedIn: 'root' })
export class SavingsLocalProvider {
  getSavings(): Observable<SavingsModel> {
    return of(getFromLocalStorage<SavingsModel>('savings'));
  }

  saveSavings(savings: SavingsModel): Observable<boolean> {
    saveToLocalStorage('savings', savings);
    return of(true);
  }
}
