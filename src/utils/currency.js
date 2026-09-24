
export const CURRENCY = 'Rs.';

export const formatCurrency = (value) => {
  const n = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  return `${CURRENCY} ${isNaN(n) ? '0.00' : n.toFixed(2)}`;
};