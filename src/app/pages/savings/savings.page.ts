import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {MatCardModule} from '@angular/material/card';
import {LoadingComponent} from '@components/loading';
import {LoadingService} from '@common/services';
import {CurrenciesModel, SavingModel, SavingTransactionModel, SavingsModel} from '@common/models';
import {SavingsService} from '@common/services/savings';
import {firstValueFrom, map, shareReplay} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';
import {DecimalPipe, DatePipe} from '@angular/common';
import {CurrenciesService} from '@common/services/currencies';
import {MatDialog} from '@angular/material/dialog';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {SavingDialogComponent, SavingDialogResult} from './saving-dialog/saving-dialog.component';
import {
  SavingTransactionDialogComponent,
  SavingTransactionDialogResult,
} from './saving-transaction-dialog/saving-transaction-dialog.component';
import {SavingsChartComponent} from './savings-chart/savings-chart.component';

interface FlatTransaction {
  transaction: SavingTransactionModel;
  saving: SavingModel;
}

@Component({
  selector: 'app-savings-page',
  imports: [
    MatIconModule,
    MatButtonModule,
    RouterLink,
    MatCardModule,
    LoadingComponent,
    DecimalPipe,
    DatePipe,
    MatButtonToggleModule,
    SavingsChartComponent,
  ],
  templateUrl: './savings.page.html',
})
export class SavingsPageComponent implements OnInit {
  private readonly savingsService = inject(SavingsService);
  private readonly currenciesService = inject(CurrenciesService);
  private readonly dialog = inject(MatDialog);
  readonly loadingSrv = new LoadingService();

  readonly savings = signal<SavingModel[]>([]);
  readonly viewMode = signal<'list' | 'chart'>('list');

  readonly currencies$ = this.currenciesService.getCurrencies$()
    .pipe(shareReplay({bufferSize: 1, refCount: true}));

  readonly currencies = toSignal(this.currencies$);
  readonly defaultCurrency = toSignal(this.currencies$.pipe(map(c => c.defaultCurrency)));

  readonly allTransactions = computed<FlatTransaction[]>(() =>
    this.savings()
      .flatMap(saving =>
        (saving.transactions ?? []).map(transaction => ({transaction, saving}))
      )
      .sort((a, b) => b.transaction.date.localeCompare(a.transaction.date))
  );

  readonly savingTotals = computed(() =>
    this.savings().map(saving => ({
      saving,
      total: (saving.transactions ?? []).reduce((sum, t) => sum + t.amount, 0),
    }))
  );

  readonly savingsTotals = computed(() =>
    this.calculateTotals(this.currencies(), this.currencies()?.defaultCurrency ?? '')
  );
  readonly savingsTotalsUsd = computed(() =>
    this.calculateTotals(this.currencies(), 'USD')
  );
  readonly savingsTotalsEur = computed(() =>
    this.calculateTotals(this.currencies(), 'EUR')
  );

  async ngOnInit(): Promise<void> {
    const model = await this.loadingSrv.waitObservable(this.savingsService.getSavings$());
    this.savings.set(model.savings);
  }

  async openSavingDialog(saving?: SavingModel): Promise<void> {
    const ref = this.dialog.open(SavingDialogComponent, {
      width: '400px',
      data: {saving},
    });
    const result = await firstValueFrom(ref.afterClosed());
    if (!result) return;

    if (result === 'delete' && saving) {
      this.savings.update(list => list.filter(s => s.id !== saving.id));
    } else {
      const dialogResult = result as SavingDialogResult;
      if (saving) {
        this.savings.update(list =>
          list.map(s => s.id === saving.id ? {...s, ...dialogResult} : s)
        );
      } else {
        const newSaving: SavingModel = {
          id: crypto.randomUUID(),
          name: dialogResult.name,
          currency: dialogResult.currency,
          transactions: [],
        };
        this.savings.update(list => [...list, newSaving]);
      }
    }
    await this.persist();
  }

  async openTransactionDialog(flat?: FlatTransaction): Promise<void> {
    const savings = this.savings();
    if (savings.length === 0) return;

    const ref = this.dialog.open(SavingTransactionDialogComponent, {
      width: '420px',
      data: {
        transaction: flat?.transaction,
        savingId: flat?.saving.id,
        savings,
      },
    });
    const result = await firstValueFrom(ref.afterClosed());
    if (!result) return;

    if (result === 'delete' && flat) {
      this.savings.update(list =>
        list.map(s =>
          s.id === flat.saving.id
            ? {...s, transactions: (s.transactions ?? []).filter(t => t.id !== flat.transaction.id)}
            : s
        )
      );
    } else {
      const r = result as SavingTransactionDialogResult;
      if (flat) {
        this.savings.update(list =>
          list.map(s => {
            if (s.id === flat.saving.id) {
              return {...s, transactions: (s.transactions ?? []).filter(t => t.id !== flat.transaction.id)};
            }
            if (s.id === r.savingId) {
              const updated: SavingTransactionModel = {...flat.transaction, amount: r.amount, date: r.date, comment: r.comment};
              return {...s, transactions: [...(s.transactions ?? []), updated]};
            }
            return s;
          })
        );
      } else {
        const newTx: SavingTransactionModel = {
          id: crypto.randomUUID(),
          amount: r.amount,
          date: r.date,
          comment: r.comment,
        };
        this.savings.update(list =>
          list.map(s =>
            s.id === r.savingId
              ? {...s, transactions: [...(s.transactions ?? []), newTx]}
              : s
          )
        );
      }
    }
    await this.persist();
  }

  async toggleIncludeInTotals(saving: SavingModel): Promise<void> {
    this.savings.update(list =>
      list.map(s => s.id === saving.id ? {...s, includeInTotals: !(s.includeInTotals ?? true)} : s)
    );
    await this.persist();
  }

  private async persist(): Promise<void> {
    const model: SavingsModel = {savings: this.savings()};
    await firstValueFrom(this.savingsService.saveSavings$(model));
  }

  private calculateTotals(currencies: CurrenciesModel | undefined, targetCurrency: string): number {
    return this.savingTotals()
      .filter(({saving}) => saving.includeInTotals !== false)
      .reduce((total, {saving, total: amount}) => {
        return total + this.convertAmount(amount, saving.currency, targetCurrency, currencies);
      }, 0);
  }

  private convertAmount(amount: number, from: string, to: string, currencies: CurrenciesModel | undefined): number {
    if (from === to || !currencies) return amount;
    const pair = currencies.currencies.find(c =>
      (c.from === from && c.to === to) || (c.from === to && c.to === from)
    );
    if (!pair) return amount;
    const rate = pair.from === from ? pair.rate : 1 / pair.rate;
    return amount * rate;
  }
}
