import dayjs from 'dayjs'
import {DayOfWeek} from '../models';

export type DateFormat = 'date' | 'month-year' | 'month-day';

const DATE_FORMATS: Record<DateFormat, string> = {
  'month-year': 'MMM-YY',
  'date': 'YYYY-MM-DD',
  'month-day': 'MMM DD (ddd)'
};

export const DATE_UTILS = {
  format: (date: Date | string, format: DateFormat): string => {
    return dayjs(date).format(DATE_FORMATS[format]);
  },
  isSame: (date1: string | Date, date2: string | Date): boolean => {
    return dayjs(date1).isSame(date2, 'day');
  },
  isBefore: (date1: string | Date, date2: string | Date): boolean => {
    return dayjs(date1).isBefore(date2, 'day');
  },
  isDayOfWeek: (date: string | Date, dayOfWeek: DayOfWeek): boolean => {
    return dayjs(date).day() === dayOfWeek;
  },
  add: (date: string | Date, amount: number, type: 'day' | 'month'): Date => {
    return dayjs(date).add(amount, type).toDate();
  },
  parse: (date: string | Date): Date => {
    return dayjs(date).toDate();
  }
}


