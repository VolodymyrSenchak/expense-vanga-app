export interface CurrentMoneyAmountModel {
  money: MoneyAmountPart[];
}

export interface MoneyAmountPart {
  name: string;
  amount: number;
  currency: string;
}
