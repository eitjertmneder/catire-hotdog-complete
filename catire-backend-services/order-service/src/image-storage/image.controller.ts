import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { ImageStorageService } from './image-storage.service';

@Controller('uploads')
export class ImageController {
  constructor(private imageStorageService: ImageStorageService) {}

  @Get('payment-proofs/:filename')
  async getPaymentProof(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const filepath = `uploads/payment-proofs/${filename}`;
    const imageBuffer = await this.imageStorageService.getImage(filepath);
    
    if (!imageBuffer) {
      throw new NotFoundException('Image not found');
    }

    // Determine content type from extension
    const ext = filename.split('.').pop()?.toLowerCase();
    const contentTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
    };

    res.setHeader('Content-Type', contentTypes[ext || 'jpg'] || 'image/jpeg');
    res.send(imageBuffer);
  }
}
