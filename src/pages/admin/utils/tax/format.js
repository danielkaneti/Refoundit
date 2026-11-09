const currency = new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
  maximumFractionDigits: 0,
});

const number = new Intl.NumberFormat('he-IL', { maximumFractionDigits: 2 });

export const formatCurrency = (value) => currency.format(Math.round(value || 0));
export const formatNumber = (value) => number.format(value || 0);
export const formatPercent = (rate) => `${Math.round(rate * 100)}%`;
