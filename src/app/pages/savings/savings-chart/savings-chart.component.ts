import {Component, computed, inject, input, signal} from '@angular/core';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {ChartConfiguration, ChartOptions} from 'chart.js';
import {BaseChartDirective} from 'ng2-charts';
import {CurrenciesModel, SavingModel} from '@common/models';
import {ChartThemeService, chartScales, withAlpha} from '@common/charts/chart-theme';
import {DATE_UTILS} from '@common/utils/date.utils';
import {SAVINGS_UTILS} from '@common/utils/savings.utils';

@Component({
  selector: 'app-savings-chart',
  templateUrl: 'savings-chart.component.html',
  styleUrl: 'savings-chart.component.scss',
  imports: [MatButtonToggleModule, BaseChartDirective],
})
export class SavingsChartComponent {
  private readonly chartTheme = inject(ChartThemeService);

  readonly savings = input.required<SavingModel[]>();
  readonly currencies = input<CurrenciesModel | undefined>();

  readonly chartMode = signal<'cumulative' | 'monthly'>('cumulative');

  readonly hasTransactions = computed(() =>
    this.savings().some(s => (s.transactions ?? []).length > 0)
  );

  readonly chartData = computed<ChartConfiguration<'line'>['data']>(() => {
    const currencies = this.currencies();
    const defaultCurrency = currencies?.defaultCurrency ?? '';
    const colors = this.chartTheme.colors();

    const allTx = this.savings()
      .filter(saving => saving.includeInTotals !== false)
      .flatMap(saving =>
        (saving.transactions ?? []).map(t => ({
          date: t.date,
          amount: SAVINGS_UTILS.convertAmount(t.amount, saving.currency, defaultCurrency, currencies),
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

    const lineColor = colors.accent;
    return {
      labels,
      datasets: [{
        type: 'line',
        label: `Total savings (${defaultCurrency})`,
        borderColor: lineColor,
        backgroundColor: withAlpha(lineColor, 0.12),
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
    const colors = this.chartTheme.colors();

    const monthlyMap = new Map<string, number>();
    this.savings()
      .filter(saving => saving.includeInTotals !== false)
      .forEach(saving => {
        (saving.transactions ?? []).forEach(t => {
          const monthKey = t.date.substring(0, 7) + '-01';
          const amount = SAVINGS_UTILS.convertAmount(t.amount, saving.currency, defaultCurrency, currencies);
          monthlyMap.set(monthKey, (monthlyMap.get(monthKey) ?? 0) + amount);
        });
      });

    const sorted = Array.from(monthlyMap.entries()).sort(([a], [b]) => a.localeCompare(b));
    const barColor = colors.accent;

    return {
      labels: sorted.map(([month]) => DATE_UTILS.format(month, 'month-year')),
      datasets: [{
        label: `Monthly (${defaultCurrency})`,
        backgroundColor: sorted.map(([, v]) => v >= 0 ? withAlpha(barColor, 0.6) : withAlpha(colors.warn, 0.6)),
        borderColor: sorted.map(([, v]) => v >= 0 ? barColor : colors.warn),
        borderWidth: 1,
        data: sorted.map(([, amount]) => Math.round(amount * 100) / 100),
      }],
    };
  });

  readonly monthlyChartOptions = computed<ChartOptions<'bar'>>(() => this.buildScaleOptions());

  private buildScaleOptions() {
    const colors = this.chartTheme.colors();
    return {
      responsive: true,
      animation: {duration: 0},
      scales: chartScales(colors) as any,
      plugins: {
        legend: {labels: {color: colors.muted, font: {family: colors.fontBody}}},
        tooltip: {
          backgroundColor: colors.ink,
          titleColor: colors.surface,
          bodyColor: colors.surface,
          bodyFont: {family: colors.fontMono},
        },
      },
    };
  }
}
