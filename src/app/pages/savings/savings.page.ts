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
import {CurrencyModel, SavingModel, SavingsModel} from '@common/models';
import {SavingsService} from '@common/services/savings';
import {MatFormFieldModule} from '@angular/material/form-field';
import {map} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';
import {DecimalPipe} from '@angular/common';

@Component({
  selector: 'app-expected-expenses-page',
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
  readonly loadingSrv = new LoadingService();

  readonly form = this.formBuilder.group({
    savings: this.formBuilder.array<UntypedFormGroup>([]),
    currencies: this.formBuilder.array<UntypedFormGroup>([]),
    defaultCurrency: ['', [Validators.required]],
  });

  readonly savingsTotals = toSignal(
    this.form.valueChanges.pipe(map(val => this.calculateTotals(val as SavingsModel)))
  );

  get defaultCurrency(): string {
    return this.form.value.defaultCurrency!;
  }

  async ngOnInit(): Promise<void> {
    const savings = await this.loadingSrv.waitObservable(this.savingsService.getSavings$());

    this.form.patchValue({ defaultCurrency: savings.defaultCurrency });

    this.form.controls.savings.clear();
    this.form.controls.currencies.clear();
    savings.savings.forEach(s => this.addSaving(s));
    savings.currencies.forEach(c => this.addCurrency(c));
  }

  addSaving(saving: SavingModel | undefined = undefined): void {
    const currency = saving?.currency ?? this.defaultCurrency;
    this.form.controls.savings.push(this.formBuilder.group({
      name: [saving?.name ?? '', [Validators.required]],
      amount: [saving?.amount ?? 0, [Validators.required, Validators.min(1), Validators.max(10000000)]],
      currency: [currency, [Validators.required]],
    }) as any);
  }

  addCurrency(currency: CurrencyModel | undefined = undefined): void {
    this.form.controls.currencies.push(this.formBuilder.group({
      from: [currency?.from ?? '', [Validators.required]],
      to: [currency?.to ?? '', [Validators.required]],
      rate: [currency?.rate ?? 1, [Validators.required]],
    }) as any);
  }

  removeSaving(index: number): void {
    this.form.controls.savings.removeAt(index);
  }

  removeCurrency(index: number): void {
    this.form.controls.currencies.removeAt(index);
  }

  async submitForm(): Promise<void> {
    if (this.form.valid) {
      const formValue = this.form.value as SavingsModel;
      await this.loadingSrv.waitObservable(this.savingsService.saveSavings$(formValue), "Saving...");
    }
  }

  private calculateTotals(savings: SavingsModel): number {
    return savings.savings.reduce((total, saving) => {
      const currency = savings.currencies.find(c =>
        (c.from === saving.currency && c.to === savings.defaultCurrency)
        || (c.from === savings.defaultCurrency && c.to === saving.currency)
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
