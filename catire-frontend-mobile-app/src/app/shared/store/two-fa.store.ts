import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TwoFASession {
  user_id: number;
  secret: string;
  enabled: boolean;
  backup_codes: string[];
  phone_number?: string;
  email?: string;
  method: 'sms' | 'email' | 'authenticator';
  created_at: Date;
}

export interface VerificationAttempt {
  code: string;
  timestamp: Date;
  success: boolean;
}

type TwoFAState = {
  sessions: Record<number, TwoFASession>;
  pendingVerification: { user_id: number; method: string } | null;
  enable2FA: (userId: number, method: 'sms' | 'email' | 'authenticator', contact: string) => TwoFASession;
  disable2FA: (userId: number) => void;
  generateBackupCodes: (userId: number) => string[];
  verifyCode: (userId: number, code: string) => boolean;
  sendVerificationCode: (userId: number) => string;
  is2FAEnabled: (userId: number) => boolean;
  getBackupCodes: (userId: number) => string[];
  regenerateBackupCodes: (userId: number) => string[];
};

export const useTwoFAStore = create<TwoFAState>()(
  persist(
    (set, get) => ({
      sessions: {},
      pendingVerification: null,

      enable2FA: (userId, method, contact) => {
        const secret = generateSecret();
        const backupCodes = generateBackupCodes();
        
        const session: TwoFASession = {
          user_id: userId,
          secret,
          enabled: true,
          backup_codes: backupCodes,
          method,
          ...(method === 'sms' ? { phone_number: contact } : { email: contact }),
          created_at: new Date(),
        };

        set((state) => ({
          sessions: { ...state.sessions, [userId]: session },
        }));

        return session;
      },

      disable2FA: (userId) => {
        set((state) => ({
          sessions: {
            ...state.sessions,
            [userId]: { ...state.sessions[userId], enabled: false },
          },
        }));
      },

      generateBackupCodes: (userId) => {
        const codes = generateBackupCodes();
        set((state) => ({
          sessions: {
            ...state.sessions,
            [userId]: { ...state.sessions[userId], backup_codes: codes },
          },
        }));
        return codes;
      },

      verifyCode: (userId, code) => {
        const session = get().sessions[userId];
        if (!session || !session.enabled) return false;
        
        // Check if it's a backup code
        if (session.backup_codes.includes(code)) {
          // Remove used backup code
          set((state) => ({
            sessions: {
              ...state.sessions,
              [userId]: {
                ...state.sessions[userId],
                backup_codes: state.sessions[userId].backup_codes.filter(c => c !== code),
              },
            },
          }));
          return true;
        }
        
        // Check TOTP code (simplified for demo)
        const currentCode = generateTOTPCode(session.secret);
        return code === currentCode;
      },

      sendVerificationCode: (userId) => {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        return code;
      },

      is2FAEnabled: (userId) => {
        const session = get().sessions[userId];
        return session?.enabled || false;
      },

      getBackupCodes: (userId) => {
        return get().sessions[userId]?.backup_codes || [];
      },

      regenerateBackupCodes: (userId) => {
        const codes = generateBackupCodes();
        set((state) => ({
          sessions: {
            ...state.sessions,
            [userId]: { ...state.sessions[userId], backup_codes: codes },
          },
        }));
        return codes;
      },
    }),
    {
      name: '2fa-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Helper functions
function generateSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 8; i++) {
    const code = Math.floor(10000000 + Math.random() * 90000000).toString();
    codes.push(code);
  }
  return codes;
}

function generateTOTPCode(secret: string): string {
  // Simplified TOTP for demo - in production use proper TOTP library
  const time = Math.floor(Date.now() / 30000);
  const hash = hashString(secret + time.toString());
  return (hash % 1000000).toString().padStart(6, '0');
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}
