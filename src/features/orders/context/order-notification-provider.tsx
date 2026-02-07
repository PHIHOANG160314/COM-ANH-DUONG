import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase-client';
import { useToast } from '@/shared/ui/use-toast';
import { Debug } from '@/shared/utils/debug';
import { useAuth } from '@/app/providers/use-auth';
import { OrderNotificationContext } from './order-notification-context';

export const OrderNotificationProvider = ({ children }: { children: ReactNode }) => {
  const { showToast } = useToast();
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [enabled, setEnabled] = useState(() => {
    const saved = localStorage.getItem('admin_notifications_enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Only allow notifications for staff roles
  const canReceiveNotifications = role === 'admin' || role === 'staff' || role === 'kitchen';

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio('/sounds/notification.mp3');

    // Request permission on mount if default and user is authorized
    if (
      canReceiveNotifications &&
      typeof Notification !== 'undefined' &&
      Notification.permission === 'default'
    ) {
      Notification.requestPermission().then(setPermission);
    }
  }, [canReceiveNotifications]);

  // Sync enabled state with local storage
  useEffect(() => {
    localStorage.setItem('admin_notifications_enabled', JSON.stringify(enabled));
  }, [enabled]);

  useEffect(() => {
    // Always subscribe to updates for data freshness, but only notify if enabled and authorized
    const channel = supabase
      .channel('order-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const order = payload.new as { id: string; total_amount: number };
          Debug.log('New order received:', order);

          // Invalidate queries to refresh data in Admin/Kitchen views
          queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
          queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });

          if (!enabled || !canReceiveNotifications) return;

          // 1. Show Toast
          showToast(`Đơn hàng mới #${order.id.slice(0, 8)}`, 'success');

          // 2. Play Sound
          if (audioRef.current) {
            audioRef.current.play().catch((err) => {
              Debug.warn('Could not play notification sound:', err);
            });
          }

          // 3. Show System Notification (if permitted)
          if (permission === 'granted') {
            new Notification('Đơn hàng mới', {
              body: `Đơn hàng #${order.id.slice(0, 8)} - ${new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(order.total_amount)}`,
              icon: '/pwa-192x192.png',
            });
          }
        }
      )
      .subscribe();

    return () => {
      Debug.log('Unsubscribing from order notifications');
      supabase.removeChannel(channel);
    };
  }, [enabled, permission, showToast, queryClient, canReceiveNotifications]);

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') return 'denied';
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  };

  return (
    <OrderNotificationContext.Provider
      value={{
        permission,
        requestPermission,
        enabled,
        setEnabled,
      }}
    >
      {children}
    </OrderNotificationContext.Provider>
  );
};
