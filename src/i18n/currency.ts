export type Currency = 'USD' | 'EUR' | 'MXN';

export const CURRENCIES: Currency[] = ['USD', 'EUR', 'MXN'];

const RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  MXN: 18,
};

const LOCALES: Record<Currency, string> = {
  USD: 'en-US',
  EUR: 'es-ES',
  MXN: 'es-MX',
};

export const formatPrice = (usd: number, currency: Currency): string => {
  const value = usd * RATES[currency];
  return new Intl.NumberFormat(LOCALES[currency], {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'MXN' ? 0 : 2,
  }).format(value);
};
