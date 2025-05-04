import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
import { SavingsModel} from '@common/models';

@Injectable({ providedIn: 'root' })
export class SavingsApiProvider {
  private readonly http = inject(HttpClient);

  getSavings(): Observable<SavingsModel> {
    return this.http.get<SavingsModel>(`savings`);
  }

  saveSavings(expenses: SavingsModel): Observable<boolean> {
    return this.http.post<boolean>(`savings`, expenses);
  }
}
