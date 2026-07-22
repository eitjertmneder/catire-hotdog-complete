import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ImageStorageService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads', 'payment-proofs');

  constructor() {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveImage(base64Data: string, orderId: string): Promise<string> {
    try {
      // Extract image data from base64
      const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!matches) {
        throw new Error('Invalid base64 image format');
      }

      const ext = matches[1];
      const data = matches[2];
      const buffer = Buffer.from(data, 'base64');

      // Generate unique filename
      const filename = `${orderId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${ext}`;
      const filepath = path.join(this.uploadDir, filename);

      // Save file
      fs.writeFileSync(filepath, buffer);

      // Return relative URL
      return `/uploads/payment-proofs/${filename}`;
    } catch (error) {
      console.error('Error saving image:', error);
      throw error;
    }
  }

  async getImage(filepath: string): Promise<Buffer | null> {
    try {
      const fullPath = path.join(process.cwd(), filepath);
      if (fs.existsSync(fullPath)) {
        return fs.readFileSync(fullPath);
      }
      return null;
    } catch (error) {
      console.error('Error reading image:', error);
      return null;
    }
  }

  async deleteImage(filepath: string): Promise<boolean> {
    try {
      const fullPath = path.join(process.cwd(), filepath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }
}
