export function formatCurrency(amount, currency = 'INR') {
  const num = Number(amount) || 0;
  const symbols = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
  };
  const symbol = symbols[currency] || currency + ' ';
  return `${symbol}${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatCompact(amount) {
  const num = Number(amount) || 0;
  if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toFixed(0);
}
