import dayjs from 'dayjs';
import 'dayjs/locale/vi';

// Set locale to Vietnamese
dayjs.locale('vi');

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const formatDate = (date: string | Date | null, format = 'DD/MM/YYYY'): string => {
  if (!date) return '';
  return dayjs(date).format(format);
};

export const formatDateTime = (date: string | Date | null, format = 'DD/MM/YYYY HH:mm'): string => {
  if (!date) return '';
  return dayjs(date).format(format);
};

export const formatRelativeTime = (date: string | Date | null): string => {
  if (!date) return '';
  const now = dayjs();
  const diff = now.diff(date, 'day');

  if (diff < 1) {
    return dayjs(date).format('HH:mm');
  } else if (diff < 7) {
    return dayjs(date).format('dddd');
  } else {
    return dayjs(date).format('DD/MM/YYYY');
  }
};
