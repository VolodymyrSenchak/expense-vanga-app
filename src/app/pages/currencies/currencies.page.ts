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
import {CurrenciesModel, CurrencyModel, SavingsModel} from '@common/models';
import {MatFormFieldModule} from '@angular/material/form-field';
import {CurrenciesService} from '@common/services/currencies';

@Component({
  selector: 'app-currencies-page',
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
  ],
  templateUrl: './currencies.page.html',
})
export class CurrenciesPageComponent implements OnInit {
  readonly currenciesService = inject(CurrenciesService);
  readonly formBuilder = inject(FormBuilder);
  readonly loadingSrv = new LoadingService();

  readonly form = this.formBuilder.group({
    currencies: this.formBuilder.array<UntypedFormGroup>([]),
    defaultCurrency: ['', [Validators.required]],
  });

  async ngOnInit(): Promise<void> {
    const currencies = await this.loadingSrv.waitObservable(this.currenciesService.getCurrencies$());

    this.form.patchValue({ defaultCurrency: currencies.defaultCurrency });
    this.form.controls.currencies.clear();
    currencies.currencies.forEach(c => this.addCurrency(c));
  }

  addCurrency(currency: CurrencyModel | undefined = undefined): void {
    this.form.controls.currencies.push(this.formBuilder.group({
      from: [currency?.from ?? '', [Validators.required]],
      to: [currency?.to ?? '', [Validators.required]],
      rate: [currency?.rate ?? 1, [Validators.required]],
    }) as any);
  }

  removeCurrency(index: number): void {
    this.form.controls.currencies.removeAt(index);
  }

  async submitForm(): Promise<void> {
    if (this.form.valid) {
      const formValue = this.form.value as CurrenciesModel;
      await this.loadingSrv.waitObservable(this.currenciesService.saveCurrencies$(formValue), "Saving...");
    }
  }
}
