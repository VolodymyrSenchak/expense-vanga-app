import {getCycleInfo} from './cycle.utils';
import {ExpenseForDay} from '@common/models/current-expenses.model';
import {DATE_UTILS} from './date.utils';

const rows = (from: string, days: number): ExpenseForDay[] =>
  Array.from({length: days}, (_, i) => ({date: DATE_UTILS.format(DATE_UTILS.add(from, i, 'day'), 'date')} as ExpenseForDay));

describe('getCycleInfo', () => {
  it('names a cycle starting on the 1st after its own month', () => {
    expect(getCycleInfo(rows('2026-10-01', 32))).toEqual({monthName: 'October', start: 'Oct 1', end: 'Nov 1'});
  });

  it('names a late-salary cycle after the month holding most days', () => {
    expect(getCycleInfo(rows('2026-09-25', 31))).toEqual({monthName: 'October', start: 'Sep 25', end: 'Oct 25'});
    expect(getCycleInfo(rows('2026-09-10', 31))).toEqual({monthName: 'September', start: 'Sep 10', end: 'Oct 10'});
  });

  it('returns null without rows', () => {
    expect(getCycleInfo([])).toBeNull();
  });
});
