export interface SavingsModel {
  savings: SavingModel[];
}

export interface SavingModel {
  amount: number;
  name: string;
  currency: string;
}
