import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface VoiceCommand {
  id: string;
  command: string;
  action: string;
  parameters?: Record<string, any>;
  confidence: number;
  timestamp: Date;
}

export interface VoiceProfile {
  user_id: number;
  enabled: boolean;
  language: string;
  sensitivity: number;
  commands: VoiceCommand[];
}

type VoiceControlState = {
  isListening: boolean;
  lastCommand: VoiceCommand | null;
  commandHistory: VoiceCommand[];
  profiles: Record<number, VoiceProfile>;
  startListening: () => void;
  stopListening: () => void;
  processCommand: (text: string) => VoiceCommand | null;
  addCommand: (command: VoiceCommand) => void;
  getCommandHistory: (userId: number) => VoiceCommand[];
  enableVoiceControl: (userId: number) => void;
  disableVoiceControl: (userId: number) => void;
  isVoiceControlEnabled: (userId: number) => boolean;
};

export const useVoiceControlStore = create<VoiceControlState>()(
  persist(
    (set, get) => ({
      isListening: false,
      lastCommand: null,
      commandHistory: [],
      profiles: {},

      startListening: () => {
        set({ isListening: true });
      },

      stopListening: () => {
        set({ isListening: false });
      },

      processCommand: (text) => {
        const lowerText = text.toLowerCase();
        
        const commands: Record<string, string> = {
          'abrir menú': 'open_menu',
          'ver carrito': 'view_cart',
          'agregar al carrito': 'add_to_cart',
          'confirmar pedido': 'confirm_order',
          'ver pedidos': 'view_orders',
          'buscar': 'search',
          'volver': 'go_back',
          'ayuda': 'help',
        };

        let action = 'unknown';
        let confidence = 0;

        for (const [phrase, cmd] of Object.entries(commands)) {
          if (lowerText.includes(phrase)) {
            action = cmd;
            confidence = 0.9;
            break;
          }
        }

        if (action === 'unknown') {
          confidence = 0.3;
        }

        const command: VoiceCommand = {
          id: Date.now().toString(),
          command: text,
          action,
          confidence,
          timestamp: new Date(),
        };

        get().addCommand(command);
        set({ lastCommand: command });

        return command;
      },

      addCommand: (command) => {
        set((state) => ({
          commandHistory: [command, ...state.commandHistory].slice(0, 50),
        }));
      },

      getCommandHistory: (userId) => {
        return get().commandHistory;
      },

      enableVoiceControl: (userId) => {
        set((state) => ({
          profiles: {
            ...state.profiles,
            [userId]: {
              user_id: userId,
              enabled: true,
              language: 'es-VE',
              sensitivity: 0.8,
              commands: [],
            },
          },
        }));
      },

      disableVoiceControl: (userId) => {
        set((state) => ({
          profiles: {
            ...state.profiles,
            [userId]: {
              ...state.profiles[userId],
              enabled: false,
            },
          },
        }));
      },

      isVoiceControlEnabled: (userId) => {
        return get().profiles[userId]?.enabled || false;
      },
    }),
    {
      name: 'voice-control-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
