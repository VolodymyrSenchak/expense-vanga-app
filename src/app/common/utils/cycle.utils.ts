import {ExpenseForDay} from '@common/models/current-expenses.model';
import {DATE_UTILS} from './date.utils';

export interface CycleInfo {
  /** Month holding most days of the cycle, e.g. "October". */
  monthName: string;
  /** First and last day, e.g. "Oct 1" and "Nov 1". */
  start: string;
  end: string;
}

/** Names the salary cycle for page titles. Display only; the rows come from CurrentExpensesService. */
export const getCycleInfo = (expenses: ExpenseForDay[]): CycleInfo | null => {
  if (!expenses.length) return null;

  const daysPerMonth = new Map<string, {count: number; date: string}>();
  for (const e of expenses) {
    const key = e.date.substring(0, 7);
    const entry = daysPerMonth.get(key) ?? {count: 0, date: e.date};
    entry.count++;
    daysPerMonth.set(key, entry);
  }
  const majority = [...daysPerMonth.values()].reduce((best, m) => m.count > best.count ? m : best);

  return {
    monthName: DATE_UTILS.format(majority.date, 'month-name'),
    start: DATE_UTILS.format(expenses[0].date, 'short-month-day'),
    end: DATE_UTILS.format(expenses[expenses.length - 1].date, 'short-month-day'),
  };
};
