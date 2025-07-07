export interface CurrencyModel {
  from: string;
  to: string;
  rate: number;
}

export interface CurrenciesModel {
  currencies: CurrencyModel[];
  defaultCurrency: string;
}
