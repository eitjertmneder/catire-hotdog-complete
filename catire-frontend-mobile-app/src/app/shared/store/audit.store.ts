import { create } from 'zustand';
import { Api } from '../api/api';
import { useAuthStore } from './auth.store';

export type AuditEventType = 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'ORDER_VIEW' | 'INVENTORY_CHANGE' | 'SYSTEM_EVENT';

export interface AuditEvent {
  event_type: AuditEventType;
  user_id?: string | number;
  user_name?: string;
  description: string;
  metadata?: Record<string, any>;
}

interface AuditState {
  logEvent: (event: AuditEvent) => Promise<void>;
}

const client = new Api();

export const useAuditStore = create<AuditState>(() => ({
  logEvent: async (event) => {
    try {
      const token = useAuthStore.getState().token;
      await client.post('orders', 'audit', event, token || undefined);
    } catch (err) {
      console.warn('Audit log failed:', err);
    }
  },
}));
