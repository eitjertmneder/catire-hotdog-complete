import * as SecureStore from 'expo-secure-store';

// Hash password - simple implementation for demo
export const hashPassword = async (password: string): Promise<string> => {
  return btoa(password);
};

// Verify password against hash
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return btoa(password) === hash;
};

// Generate secure random token
export const generateToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Hash sensitive data
export const hashData = async (data: string): Promise<string> => {
  return btoa(data);
};

// Secure storage operations
export const secureStorage = {
  set: async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value);
  },
  get: async (key: string) => {
    return await SecureStore.getItemAsync(key);
  },
  remove: async (key: string) => {
    await SecureStore.deleteItemAsync(key);
  },
  clear: async () => {
    const keys = ['token', 'user_email', 'user_password', 'biometric_enabled'];
    for (const key of keys) {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

// Validate and sanitize input
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/<\/script/gi, '')
    .trim();
};

// Validate email format
export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate password strength
export const validatePassword = (password: string): { valid: boolean; message: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'La contraseña debe tener al menos 8 caracteres' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'La contraseña debe contener al menos una mayúscula' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'La contraseña debe contener al menos una minúscula' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'La contraseña debe contener al menos un número' };
  }
  return { valid: true, message: 'Contraseña válida' };
};

// Rate limiting for login attempts
const loginAttempts: Record<string, { count: number; lastAttempt: Date }> = {};

export const checkLoginRateLimit = (identifier: string): boolean => {
  const now = new Date();
  const attempts = loginAttempts[identifier];
  
  if (!attempts) return true;
  
  if (now.getTime() - attempts.lastAttempt.getTime() > 15 * 60 * 1000) {
    delete loginAttempts[identifier];
    return true;
  }
  
  return attempts.count < 5;
};

export const recordLoginAttempt = (identifier: string) => {
  const now = new Date();
  const attempts = loginAttempts[identifier] || { count: 0, lastAttempt: now };
  loginAttempts[identifier] = {
    count: attempts.count + 1,
    lastAttempt: now,
  };
};

// Validate IP address
export const validateIP = (ip: string): boolean => {
  const re = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return re.test(ip);
};

// Hash IP for storage
export const hashIP = async (ip: string): Promise<string> => {
  return await hashData(ip + '_salt_catire_hotdog');
};
