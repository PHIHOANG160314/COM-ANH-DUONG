export type StoreStatus = 'open' | 'closing' | 'closed';

interface StoreTimeConfig {
  openHour: number; // 10
  closeHour: number; // 22
  closingSoonMinutes: number; // 30
}

const DEFAULT_CONFIG: StoreTimeConfig = {
  openHour: 10,
  closeHour: 22,
  closingSoonMinutes: 30,
};

export const getStoreStatus = (
  config: StoreTimeConfig = DEFAULT_CONFIG
): {
  status: StoreStatus;
  message: string;
  details: string;
  color: 'success' | 'warning' | 'error';
} => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Convert current time to minutes from midnight for easier comparison
  const currentTotalMinutes = currentHour * 60 + currentMinute;
  const openTotalMinutes = config.openHour * 60;
  const closeTotalMinutes = config.closeHour * 60;
  const closingSoonTotalMinutes = closeTotalMinutes - config.closingSoonMinutes;

  if (currentTotalMinutes >= openTotalMinutes && currentTotalMinutes < closingSoonTotalMinutes) {
    return {
      status: 'open',
      message: 'Đang mở cửa',
      details: `Mở cửa từ ${config.openHour}:00 - ${config.closeHour}:00`,
      color: 'success',
    };
  } else if (
    currentTotalMinutes >= closingSoonTotalMinutes &&
    currentTotalMinutes < closeTotalMinutes
  ) {
    return {
      status: 'closing',
      message: 'Sắp đóng cửa',
      details: `Chỉ nhận đơn đến ${config.closeHour}:00`,
      color: 'warning',
    };
  } else {
    return {
      status: 'closed',
      message: 'Đã đóng cửa',
      details: `Mở cửa lại lúc ${config.openHour}:00 sáng mai`,
      color: 'error',
    };
  }
};
