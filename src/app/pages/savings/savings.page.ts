import {Component, inject, OnInit} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {FormBuilder, ReactiveFormsModule, UntypedFormGroup, Validators} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatCardModule} from '@angular/material/card';
import {LoadingComponent} from '@components/loading';
import {LoadingService} from '@common/services';
import {CurrenciesModel, CurrencyModel, SavingModel, SavingsModel} from '@common/models';
import {SavingsService} from '@common/services/savings';
import {MatFormFieldModule} from '@angular/material/form-field';
import {combineLatest, map, shareReplay} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';
import {DecimalPipe} from '@angular/common';
import {CurrenciesService} from '@common/services/currencies';

@Component({
  selector: 'app-savings-page',
  imports: [
    MatIconModule,
    MatButtonModule,
    RouterLink,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    LoadingComponent,
    MatFormFieldModule,
    DecimalPipe,
  ],
  templateUrl: './savings.page.html',
})
export class SavingsPageComponent implements OnInit {
  readonly savingsService = inject(SavingsService);
  readonly formBuilder = inject(FormBuilder);
  readonly currenciesService = inject(CurrenciesService);
  readonly loadingSrv = new LoadingService();

  readonly form = this.formBuilder.group({
    savings: this.formBuilder.array<UntypedFormGroup>([]),
  });

  readonly currencies$ = this.currenciesService.getCurrencies$()
    .pipe(shareReplay({ bufferSize: 1, refCount: true }));

  readonly defaultCurrency = toSignal(this.currencies$.pipe(map(c => c.defaultCurrency)));
  readonly savingsTotals = toSignal(
    combineLatest([this.form.valueChanges, this.currencies$]).pipe(
      map(([formValue, currencies]) => this.calculateTotals(formValue as SavingsModel, currencies))
    )
  );

  async ngOnInit(): Promise<void> {
    const savings = await this.loadingSrv.waitObservable(this.savingsService.getSavings$());

    this.form.controls.savings.clear();
    savings.savings.forEach(s => this.addSaving(s));
  }

  addSaving(saving: SavingModel | undefined = undefined): void {
    const currency = saving?.currency ?? this.defaultCurrency();
    this.form.controls.savings.push(this.formBuilder.group({
      name: [saving?.name ?? '', [Validators.required]],
      amount: [saving?.amount ?? 0, [Validators.required, Validators.min(1), Validators.max(10000000)]],
      currency: [currency, [Validators.required]],
    }) as any);
  }

  removeSaving(index: number): void {
    this.form.controls.savings.removeAt(index);
  }

  async submitForm(): Promise<void> {
    if (this.form.valid) {
      const formValue = this.form.value as SavingsModel;
      await this.loadingSrv.waitObservable(this.savingsService.saveSavings$(formValue), "Saving...");
    }
  }

  private calculateTotals(savings: SavingsModel, currenciesModel: CurrenciesModel): number {
    return savings.savings.reduce((total, saving) => {
      const currency = currenciesModel.currencies.find(c =>
        (c.from === saving.currency && c.to === currenciesModel.defaultCurrency)
        || (c.from === currenciesModel.defaultCurrency && c.to === saving.currency)
      );
      const rate = !currency ? 1 : (
        currency.from === saving.currency
          ? currency.rate
          : 1 / currency.rate
      );
      return total + saving.amount * rate;
    }, 0);
  }
}
