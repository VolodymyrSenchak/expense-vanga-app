import {Component, computed, inject, input, signal} from '@angular/core';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatIconModule} from '@angular/material/icon';
import {ChartConfiguration, ChartOptions} from 'chart.js';
import {BaseChartDirective} from 'ng2-charts';
import {CurrenciesModel, SavingModel} from '@common/models';
import {ThemeService} from '@common/services/theme.service';
import {DATE_UTILS} from '@common/utils/date.utils';

@Component({
  selector: 'app-savings-chart',
  templateUrl: 'savings-chart.component.html',
  imports: [MatButtonToggleModule, MatIconModule, BaseChartDirective],
})
export class SavingsChartComponent {
  private readonly themeService = inject(ThemeService);

  readonly savings = input.required<SavingModel[]>();
  readonly currencies = input<CurrenciesModel | undefined>();

  readonly chartMode = signal<'cumulative' | 'monthly'>('cumulative');

  readonly hasTransactions = computed(() =>
    this.savings().some(s => (s.transactions ?? []).length > 0)
  );

  readonly chartData = computed<ChartConfiguration<'line'>['data']>(() => {
    const currencies = this.currencies();
    const defaultCurrency = currencies?.defaultCurrency ?? '';
    const dark = this.themeService.isDark();

    const allTx = this.savings()
      .filter(saving => saving.includeInTotals !== false)
      .flatMap(saving =>
        (saving.transactions ?? []).map(t => ({
          date: t.date,
          amount: this.convertAmount(t.amount, saving.currency, defaultCurrency, currencies),
        }))
      )
      .sort((a, b) => a.date.localeCompare(b.date));

    if (allTx.length === 0) {
      return {labels: [], datasets: []};
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

  readonly chartOptions = computed<ChartOptions<'line'>>(() => this.buildScaleOptions());

  readonly monthlyChartData = computed<ChartConfiguration<'bar'>['data']>(() => {
    const currencies = this.currencies();
    const defaultCurrency = currencies?.defaultCurrency ?? '';
    const dark = this.themeService.isDark();

    const monthlyMap = new Map<string, number>();
    this.savings()
      .filter(saving => saving.includeInTotals !== false)
      .forEach(saving => {
        (saving.transactions ?? []).forEach(t => {
          const monthKey = t.date.substring(0, 7) + '-01';
          const amount = this.convertAmount(t.amount, saving.currency, defaultCurrency, currencies);
          monthlyMap.set(monthKey, (monthlyMap.get(monthKey) ?? 0) + amount);
        });
      });

    const sorted = Array.from(monthlyMap.entries()).sort(([a], [b]) => a.localeCompare(b));
    const barColor = dark ? '#94B4C1' : '#213448';

    return {
      labels: sorted.map(([month]) => DATE_UTILS.format(month, 'month-year')),
      datasets: [{
        label: `Monthly (${defaultCurrency})`,
        backgroundColor: sorted.map(([, v]) => v >= 0 ? barColor + '99' : '#e5393599'),
        borderColor: sorted.map(([, v]) => v >= 0 ? barColor : '#e53935'),
        borderWidth: 1,
        data: sorted.map(([, amount]) => Math.round(amount * 100) / 100),
      }],
    };
  });

  readonly monthlyChartOptions = computed<ChartOptions<'bar'>>(() => this.buildScaleOptions());

  private buildScaleOptions() {
    const gridColor = this.themeService.isDark() ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';
    const tickColor = this.themeService.isDark() ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
    return {
      responsive: true,
      animation: {duration: 0},
      scales: {
        x: {grid: {color: gridColor}, ticks: {color: tickColor}},
        y: {grid: {color: gridColor}, ticks: {color: tickColor}},
      },
    };
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
