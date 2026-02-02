import { CONTACT_INFO } from '@/shared/config/contact';

export type StoreStatus = 'open' | 'closing' | 'closed';

interface StoreTimeConfig {
  openHour: number;
  closeHour: number;
  closingSoonMinutes: number;
  timezone: string;
}

// Parse hours from CONTACT_INFO string "8:00 - 22:00 hàng ngày"
const parseHours = (hoursString: string): { open: number; close: number } => {
  try {
    const matches = hoursString.match(/(\d{1,2}):00\s*-\s*(\d{1,2}):00/);
    if (matches && matches.length >= 3) {
      return {
        open: parseInt(matches[1], 10),
        close: parseInt(matches[2], 10),
      };
    }
  } catch (e) {
    console.error('Failed to parse store hours', e);
  }
  // Fallback default
  return { open: 8, close: 22 };
};

const { open, close } = parseHours(CONTACT_INFO.hours);

const DEFAULT_CONFIG: StoreTimeConfig = {
  openHour: open,
  closeHour: close,
  closingSoonMinutes: 30,
  timezone: 'Asia/Ho_Chi_Minh', // Vietnam Time
};

export const getStoreStatus = (
  config: StoreTimeConfig = DEFAULT_CONFIG
): {
  status: StoreStatus;
  message: string;
  details: string;
  color: 'success' | 'warning' | 'error';
  nextOpenTime?: Date;
} => {
  // Create date object in target timezone
  const now = new Date();

  // We need to operate in local time (system time) effectively representing Vietnam time
  // But since this runs on client, 'now' is client local time.
  // Ideally we should use a library like date-fns-tz or generic logic if users are outside Vietnam.
  // For simplicity assuming users are in VN or we check against local hours (8-22 local time).
  // However, strict business requirement usually implies Vietnam time regardless of user location.

  // Let's use simple hour check for now, assuming the user is in the same timezone or we just enforce "wall clock" time.
  // If we want to be strict about Vietnam time:
  const vnTime = new Date(now.toLocaleString('en-US', { timeZone: config.timezone }));

  const currentHour = vnTime.getHours();
  const currentMinute = vnTime.getMinutes();

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
    // Calculate next open time
    const nextOpen = new Date(vnTime);
    if (currentTotalMinutes >= closeTotalMinutes) {
      // It's late night, opens tomorrow
      nextOpen.setDate(nextOpen.getDate() + 1);
    }
    // If it's early morning (before open), opens today (date matches already)

    nextOpen.setHours(config.openHour, 0, 0, 0);

    return {
      status: 'closed',
      message: 'Đã đóng cửa',
      details: `Mở cửa lại lúc ${config.openHour}:00 ${currentTotalMinutes >= closeTotalMinutes ? 'sáng mai' : 'hôm nay'}`,
      color: 'error',
      nextOpenTime: nextOpen,
    };
  }
};

export const STORE_CONFIG = DEFAULT_CONFIG;
