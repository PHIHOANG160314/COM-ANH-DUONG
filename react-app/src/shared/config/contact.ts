/**
 * Centralized contact information configuration
 * Single source of truth for all contact details across the app
 */
export const CONTACT_INFO = {
  phone: '0123 456 789',
  zalo: '0909000900',
  address: {
    full: '581C Hùng Vương, Xã Tân Phú Đông, Đồng Tháp',
    short: '581C Hùng Vương, Tân Phú Đông',
    street: '581C Hùng Vương',
    district: 'Xã Tân Phú Đông',
    province: 'Đồng Tháp',
  },
  landmark: 'Đối diện Viva Start Coffee',
  hours: '8:00 - 22:00 hàng ngày',
  geo: {
    latitude: 10.3567,
    longitude: 105.6789,
  },
} as const;

export default CONTACT_INFO;
