import {Component, computed, inject, viewChild} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {MatAutocomplete, MatAutocompleteModule} from '@angular/material/autocomplete';
import {CurrenciesService} from '@common/services/currencies';

/**
 * Suggests the currencies the app knows (default plus those in Currencies) for a free-text field.
 * Usage: `<input matInput [matAutocomplete]="currencies.panel()"> <ev-currency-autocomplete #currencies />`
 */
@Component({
  selector: 'ev-currency-autocomplete',
  imports: [MatAutocompleteModule],
  template: `
    <mat-autocomplete #panel="matAutocomplete">
      @for (code of codes(); track code) {
        <mat-option [value]="code">{{ code }}</mat-option>
      }
    </mat-autocomplete>
  `,
})
export class CurrencyAutocompleteComponent {
  private readonly currenciesService = inject(CurrenciesService);
  private readonly currencies = toSignal(this.currenciesService.getCurrencies$());

  readonly panel = viewChild.required<MatAutocomplete>('panel');

  readonly codes = computed(() => {
    const model = this.currencies();
    if (!model) return [];
    const codes = [model.defaultCurrency, ...model.currencies.flatMap(c => [c.from, c.to])]
      .map(c => (c ?? '').trim().toUpperCase())
      .filter(Boolean);
    return [...new Set(codes)].sort();
  });
}
