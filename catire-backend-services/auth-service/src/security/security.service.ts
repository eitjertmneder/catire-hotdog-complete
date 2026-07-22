import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class SecurityService {
  private readonly SALT_ROUNDS = 12;
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key';
  private readonly HASH_PEPPER = process.env.HASH_PEPPER || 'catire_hotdog_pepper_2024';

  // Hash password with bcrypt
  async hashPassword(password: string): Promise<string> {
    const pepperedPassword = password + this.HASH_PEPPER;
    return await bcrypt.hash(pepperedPassword, this.SALT_ROUNDS);
  }

  // Verify password against hash
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const pepperedPassword = password + this.HASH_PEPPER;
    return await bcrypt.compare(pepperedPassword, hash);
  }

  // Hash sensitive data with SHA-256
  hashData(data: string): string {
    return crypto
      .createHash('sha256')
      .update(data + this.HASH_PEPPER)
      .digest('hex');
  }

  // Generate secure random token
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  // Validate password strength
  validatePasswordStrength(password: string): {
    valid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score += 1;
    else feedback.push('Debe tener al menos 8 caracteres');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Debe contener mayúsculas');

    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Debe contener minúsculas');

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('Debe contener números');

    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    else feedback.push('Debe contener caracteres especiales');

    return {
      valid: score >= 4,
      score,
      feedback,
    };
  }

  // Sanitize input to prevent SQL injection
  sanitizeInput(input: string): string {
    if (typeof input !== 'string') return input;
    return input
      .replace(/'/g, "''")
      .replace(/--/g, '')
      .replace(/;/g, '')
      .trim();
  }

  // Validate and hash email
  hashEmail(email: string): string {
    const normalizedEmail = email.toLowerCase().trim();
    return this.hashData(normalizedEmail);
  }

  // Generate API key
  generateApiKey(): string {
    return `catire_${this.generateToken(40)}`;
  }

  // Validate API key format
  validateApiKeyFormat(apiKey: string): boolean {
    return /^catire_[a-f0-9]{40}$/.test(apiKey);
  }
}
