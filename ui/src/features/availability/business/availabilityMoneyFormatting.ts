import type { AvailabilityCurrency } from '../types';

export type AvailabilityMoneyFormattingOptions = {
  locale?: string;
};

function normalizeCurrencyWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function formatFallbackAmount(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatAvailabilityMoney(
  amount: number,
  currency: AvailabilityCurrency,
  options: AvailabilityMoneyFormattingOptions = {},
): string {
  const locale = options.locale ?? 'en';

  try {
    const formattedValue = new Intl.NumberFormat(locale, {
      currency,
      currencyDisplay: 'code',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
      style: 'currency',
    }).format(amount);
    const normalizedValue = normalizeCurrencyWhitespace(formattedValue);

    return normalizedValue.includes(currency)
      ? normalizedValue
      : `${currency} ${normalizedValue}`;
  } catch {
    return `${currency} ${formatFallbackAmount(amount, locale)}`;
  }
}

const availabilityMoneyFormatting = {
  formatAvailabilityMoney,
} as const;

export default availabilityMoneyFormatting;
