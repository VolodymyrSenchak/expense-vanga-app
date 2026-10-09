import {inject, LOCALE_ID, Pipe, PipeTransform} from '@angular/core';
import {formatNumber} from '@angular/common';

/**
 * Display format for a spent amount: spending shows without a minus sign,
 * negative spending (refund, income) keeps a leading "+". Display only.
 */
@Pipe({
  name: 'spendAmount'
})
export class SpendAmountPipe implements PipeTransform {
  private readonly locale = inject(LOCALE_ID);

  transform(value: number | null | undefined, digitsInfo = '1.2-2'): string {
    const num = Number(value ?? 0);
    if (isNaN(num)) return '';
    const formatted = formatNumber(Math.abs(num), this.locale, digitsInfo);
    return num < 0 ? `+${formatted}` : formatted;
  }
}
