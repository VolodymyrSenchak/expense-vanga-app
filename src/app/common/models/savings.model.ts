import { CurrencyModel } from "./currency.model";

export interface SavingsModel {
  savings: SavingModel[];
  currencies: CurrencyModel[];
  defaultCurrency: string;
}

export interface SavingModel {
  amount: number;
  name: string;
  currency: string;
}
