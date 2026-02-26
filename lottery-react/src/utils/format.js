// src/utils/format.js

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatThaiDateTime = (isoDate) => {
  if (!isoDate) return '-';
  const date = new Date(isoDate);
  return date.toLocaleString('th-TH', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) + ' น.';
};

export const formatThaiDate = (isoDate) => {
  if (!isoDate) return '-';
  const date = new Date(isoDate);
  return date.toLocaleDateString('th-TH', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default {
  formatCurrency,
  formatThaiDateTime,
  formatThaiDate,
};
