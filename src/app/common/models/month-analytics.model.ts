export interface MonthAnalyticsModel {
  expectedAmountLeft: number;
  actualAmountLeft: number;
  diff: number;
}

/** Spending from the first day of the cycle through today (inclusive). */
export interface SpentSoFarModel {
  fromDate: string;
  expectedSpent: number;
  actualSpent: number;
  /** actualSpent - expectedSpent: positive means over plan. */
  overPlan: number;
}
