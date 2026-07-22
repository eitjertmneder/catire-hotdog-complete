import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ChatMessage {
  id: string;
  order_id: string;
  sender_id: number;
  sender_name: string;
  message: string;
  read: boolean;
  created_at: Date;
}

export interface ChatConversation {
  order_id: string;
  client_name: string;
  worker_name: string;
  last_message: string;
  last_message_at: Date;
  unread_count: number;
}

type ChatState = {
  messages: Record<string, ChatMessage[]>;
  conversations: ChatConversation[];
  sendMessage: (orderId: string, senderId: number, senderName: string, message: string) => void;
  getMessages: (orderId: string) => ChatMessage[];
  markAsRead: (orderId: string) => void;
  getConversations: () => ChatConversation[];
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: {},
      conversations: [],

      sendMessage: (orderId, senderId, senderName, message) => {
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          order_id: orderId,
          sender_id: senderId,
          sender_name: senderName,
          message,
          read: false,
          created_at: new Date(),
        };

        set((state) => {
          const orderMessages = state.messages[orderId] || [];
          const updatedMessages = {
            ...state.messages,
            [orderId]: [...orderMessages, newMessage],
          };

          // Update or create conversation
          const existingConv = state.conversations.find(c => c.order_id === orderId);
          let updatedConversations;
          
          if (existingConv) {
            updatedConversations = state.conversations.map(c =>
              c.order_id === orderId
                ? { ...c, last_message: message, last_message_at: new Date(), unread_count: c.unread_count + 1 }
                : c
            );
          } else {
            updatedConversations = [
              {
                order_id: orderId,
                client_name: '',
                worker_name: '',
                last_message: message,
                last_message_at: new Date(),
                unread_count: 1,
              },
              ...state.conversations,
            ];
          }

          return { messages: updatedMessages, conversations: updatedConversations };
        });
      },

      getMessages: (orderId) => {
        return get().messages[orderId] || [];
      },

      markAsRead: (orderId) => {
        set((state) => ({
          messages: {
            ...state.messages,
            [orderId]: (state.messages[orderId] || []).map(m => ({ ...m, read: true })),
          },
          conversations: state.conversations.map(c =>
            c.order_id === orderId ? { ...c, unread_count: 0 } : c
          ),
        }));
      },

      getConversations: () => {
        return get().conversations;
      },
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
