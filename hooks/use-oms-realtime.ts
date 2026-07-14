'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

type RealtimePayload = {
  orderId?: string;
  onOrderUpdate?: () => void;
  onNotification?: () => void;
};

export function useOmsRealtime({ orderId, onOrderUpdate, onNotification }: RealtimePayload) {
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const supabase = supabaseRef.current;
    const channels: ReturnType<typeof supabase.channel>[] = [];

    if (orderId && onOrderUpdate) {
      const historyChannel = supabase
        .channel(`oms-order-${orderId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'order_status_history',
            filter: `order_id=eq.${orderId}`,
          },
          () => onOrderUpdate(),
        )
        .subscribe();
      channels.push(historyChannel);
    }

    if (onNotification) {
      const notifChannel = supabase
        .channel('oms-notifications')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications' },
          () => onNotification(),
        )
        .subscribe();
      channels.push(notifChannel);
    }

    return () => {
      channels.forEach((channel) => {
        void supabase.removeChannel(channel);
      });
    };
  }, [orderId, onOrderUpdate, onNotification]);
}
