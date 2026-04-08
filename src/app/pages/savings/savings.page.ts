import {Component, computed, inject, OnInit, signal, viewChild} from '@angular/core';
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
import {ChartConfiguration, ChartOptions} from 'chart.js';
import {BaseChartDirective} from 'ng2-charts';
import {ThemeService} from '@common/services/theme.service';
import {DATE_UTILS} from '@common/utils/date.utils';
import {SavingDialogComponent, SavingDialogResult} from './saving-dialog/saving-dialog.component';
import {
  SavingTransactionDialogComponent,
  SavingTransactionDialogResult,
} from './saving-transaction-dialog/saving-transaction-dialog.component';

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
    BaseChartDirective,
  ],
  templateUrl: './savings.page.html',
})
export class SavingsPageComponent implements OnInit {
  private readonly savingsService = inject(SavingsService);
  private readonly currenciesService = inject(CurrenciesService);
  private readonly dialog = inject(MatDialog);
  readonly themeService = inject(ThemeService);
  readonly loadingSrv = new LoadingService();

  readonly savings = signal<SavingModel[]>([]);
  readonly viewMode = signal<'list' | 'chart'>('list');

  readonly chart = viewChild(BaseChartDirective);

  readonly currencies$ = this.currenciesService.getCurrencies$()
    .pipe(shareReplay({ bufferSize: 1, refCount: true }));

  readonly currencies = toSignal(this.currencies$);
  readonly defaultCurrency = toSignal(this.currencies$.pipe(map(c => c.defaultCurrency)));

  readonly allTransactions = computed<FlatTransaction[]>(() =>
    this.savings()
      .flatMap(saving =>
        (saving.transactions ?? []).map(transaction => ({ transaction, saving }))
      )
      .sort((a, b) => b.transaction.date.localeCompare(a.transaction.date))
  );

  readonly savingTotals = computed(() => {
    return this.savings().map(saving => ({
      saving,
      total: (saving.transactions ?? []).reduce((sum, t) => sum + t.amount, 0),
    }));
  });

  readonly savingsTotals = computed(() =>
    this.calculateTotals(this.currencies(), this.currencies()?.defaultCurrency ?? '')
  );
  readonly savingsTotalsUsd = computed(() =>
    this.calculateTotals(this.currencies(), 'USD')
  );
  readonly savingsTotalsEur = computed(() =>
    this.calculateTotals(this.currencies(), 'EUR')
  );

  readonly chartData = computed<ChartConfiguration<'line'>['data']>(() => {
    const currencies = this.currencies();
    const defaultCurrency = currencies?.defaultCurrency ?? '';
    const dark = this.themeService.isDark();

    const allTx = this.savings()
      .flatMap(saving =>
        (saving.transactions ?? []).map(t => ({
          date: t.date,
          amount: this.convertAmount(t.amount, saving.currency, defaultCurrency, currencies),
        }))
      )
      .sort((a, b) => a.date.localeCompare(b.date));

    if (allTx.length === 0) {
      return { labels: [], datasets: [] };
    }

    let running = 0;
    const labels: string[] = [];
    const data: number[] = [];

    for (const tx of allTx) {
      running += tx.amount;
      labels.push(DATE_UTILS.format(tx.date, 'date'));
      data.push(Math.round(running * 100) / 100);
    }

    const lineColor = dark ? '#94B4C1' : '#213448';
    return {
      labels,
      datasets: [{
        type: 'line',
        label: `Total savings (${defaultCurrency})`,
        borderColor: lineColor,
        backgroundColor: lineColor + '33',
        data,
        fill: true,
        pointRadius: 4,
        tension: 0.3,
      }],
    };
  });

  readonly chartOptions = computed<ChartOptions<'line'>>(() => {
    const gridColor = this.themeService.isDark() ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';
    const tickColor = this.themeService.isDark() ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
    return {
      responsive: true,
      animation: { duration: 0 },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: tickColor } },
        y: { grid: { color: gridColor }, ticks: { color: tickColor } },
      },
    };
  });

  async ngOnInit(): Promise<void> {
    const model = await this.loadingSrv.waitObservable(this.savingsService.getSavings$());
    this.savings.set(model.savings);
  }

  async openSavingDialog(saving?: SavingModel): Promise<void> {
    const ref = this.dialog.open(SavingDialogComponent, {
      width: '400px',
      data: { saving },
    });
    const result = await firstValueFrom(ref.afterClosed());
    if (!result) return;

    if (result === 'delete' && saving) {
      this.savings.update(list => list.filter(s => s.id !== saving.id));
    } else {
      const dialogResult = result as SavingDialogResult;
      if (saving) {
        this.savings.update(list =>
          list.map(s => s.id === saving.id ? { ...s, ...dialogResult } : s)
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
            ? { ...s, transactions: (s.transactions ?? []).filter(t => t.id !== flat.transaction.id) }
            : s
        )
      );
    } else {
      const r = result as SavingTransactionDialogResult;
      if (flat) {
        // Edit: remove from old saving, add to new saving
        this.savings.update(list =>
          list.map(s => {
            if (s.id === flat.saving.id) {
              return { ...s, transactions: (s.transactions ?? []).filter(t => t.id !== flat.transaction.id) };
            }
            if (s.id === r.savingId) {
              const updated: SavingTransactionModel = { ...flat.transaction, amount: r.amount, date: r.date, comment: r.comment };
              return { ...s, transactions: [...(s.transactions ?? []), updated] };
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
              ? { ...s, transactions: [...(s.transactions ?? []), newTx] }
              : s
          )
        );
      }
    }
    await this.persist();
  }

  private async persist(): Promise<void> {
    const model: SavingsModel = { savings: this.savings() };
    await firstValueFrom(this.savingsService.saveSavings$(model));
  }

  private calculateTotals(currencies: CurrenciesModel | undefined, targetCurrency: string): number {
    return this.savingTotals().reduce((total, { saving, total: amount }) => {
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
