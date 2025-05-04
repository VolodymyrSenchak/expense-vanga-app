export interface SavingsModel {
  savings: SavingModel[];
  currencies: CurrencyModel[];
  defaultCurrency: string;
}

export interface CurrencyModel {
  from: string;
  to: string;
  rate: number;
}

export interface SavingModel {
  amount: number;
  name: string;
  currency: string;
}
