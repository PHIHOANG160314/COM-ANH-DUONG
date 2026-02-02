import { createContext } from 'react';

export interface OrderNotificationContextType {
  permission: NotificationPermission;
  requestPermission: () => Promise<NotificationPermission>;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

export const OrderNotificationContext = createContext<OrderNotificationContextType | undefined>(
  undefined
);
