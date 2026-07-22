import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WhatsAppMessage {
  id: string;
  phone: string;
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  type: 'text' | 'image' | 'template' | 'order_update';
  sent_at?: Date;
  delivered_at?: Date;
  read_at?: Date;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  message: string;
  variables: string[];
  category: 'order' | 'promotion' | 'reminder';
}

type WhatsAppState = {
  messages: WhatsAppMessage[];
  templates: WhatsAppTemplate[];
  sendMessage: (phone: string, message: string, type?: WhatsAppMessage['type']) => Promise<WhatsAppMessage>;
  sendTemplate: (phone: string, templateId: string, variables: Record<string, string>) => Promise<WhatsAppMessage>;
  sendOrderUpdate: (phone: string, orderId: string, status: string) => Promise<WhatsAppMessage>;
  getMessageStatus: (messageId: string) => WhatsAppMessage['status'] | undefined;
  getMessagesByPhone: (phone: string) => WhatsAppMessage[];
  getTemplatesByCategory: (category: string) => WhatsAppTemplate[];
};

export const useWhatsAppStore = create<WhatsAppState>()(
  persist(
    (set, get) => ({
      messages: [],
      templates: [
        {
          id: 'order_received',
          name: 'Pedido Recibido',
          message: '¡Hola {{name}}! Tu pedido #{{orderId}} ha sido recibido. Total: ${{total}}',
          variables: ['name', 'orderId', 'total'],
          category: 'order',
        },
        {
          id: 'order_preparing',
          name: 'Pedido Preparando',
          message: '¡Hola {{name}}! Tu pedido #{{orderId}} está siendo preparado.',
          variables: ['name', 'orderId'],
          category: 'order',
        },
        {
          id: 'order_ready',
          name: 'Pedido Listo',
          message: '¡Hola {{name}}! Tu pedido #{{orderId}} está listo para recoger.',
          variables: ['name', 'orderId'],
          category: 'order',
        },
        {
          id: 'weekly_promo',
          name: 'Promoción Semanal',
          message: '¡Ofertas especiales esta semana en Catire Hot Dog! Descuento de {{discount}}%',
          variables: ['discount'],
          category: 'promotion',
        },
      ],

      sendMessage: async (phone, message, type = 'text') => {
        const newMessage: WhatsAppMessage = {
          id: Date.now().toString(),
          phone,
          message,
          status: 'pending',
          type,
        };

        set((state) => ({
          messages: [newMessage, ...state.messages],
        }));

        // Simulate sending
        await new Promise(resolve => setTimeout(resolve, 1000));

        set((state) => ({
          messages: state.messages.map(m =>
            m.id === newMessage.id ? { ...m, status: 'sent', sent_at: new Date() } : m
          ),
        }));

        return get().messages.find(m => m.id === newMessage.id)!;
      },

      sendTemplate: async (phone, templateId, variables) => {
        const template = get().templates.find(t => t.id === templateId);
        if (!template) throw new Error('Template not found');

        let message = template.message;
        Object.entries(variables).forEach(([key, value]) => {
          message = message.replace(`{{${key}}}`, value);
        });

        return get().sendMessage(phone, message, 'template');
      },

      sendOrderUpdate: async (phone, orderId, status) => {
        const statusMessages: Record<string, string> = {
          'received': `Tu pedido #${orderId} ha sido recibido`,
          'preparing': `Tu pedido #${orderId} está siendo preparado`,
          'ready': `Tu pedido #${orderId} está listo para recoger`,
          'delivered': `Tu pedido #${orderId} ha sido entregado`,
        };

        const message = statusMessages[status] || `Actualización del pedido #${orderId}: ${status}`;
        return get().sendMessage(phone, message, 'order_update');
      },

      getMessageStatus: (messageId) => {
        return get().messages.find(m => m.id === messageId)?.status;
      },

      getMessagesByPhone: (phone) => {
        return get().messages.filter(m => m.phone === phone);
      },

      getTemplatesByCategory: (category) => {
        return get().templates.filter(t => t.category === category);
      },
    }),
    {
      name: 'whatsapp-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
