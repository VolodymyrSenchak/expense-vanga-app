export interface SavingsModel {
  savings: SavingModel[];
}

export interface SavingModel {
  id: string;
  name: string;
  currency: string;

  transactions?: SavingTransactionModel[];
}

export interface SavingTransactionModel {
  id: string;
  amount: number;
  date: string;
  comment?: string;
}
