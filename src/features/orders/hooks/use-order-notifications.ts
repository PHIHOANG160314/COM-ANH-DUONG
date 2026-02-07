import { useContext } from 'react';
import { OrderNotificationContext } from '../context/order-notification-context';

export const useOrderNotifications = () => {
  const context = useContext(OrderNotificationContext);
  if (context === undefined) {
    throw new Error('useOrderNotifications must be used within a OrderNotificationProvider');
  }
  return context;
};
