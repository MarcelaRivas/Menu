import {
  Injectable, BadRequestException, NotFoundException, StreamableFile,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as path from 'path';
import * as fs from 'fs';
import sharp from 'sharp';

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
  }

  async upload(
    restaurantId: number,
    file: Express.Multer.File,
  ): Promise<any> {
    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de archivo no permitido. Usa JPG, PNG o WebP.`,
      );
    }

    if (file.size > MAX_SIZE) {
      throw new BadRequestException('La imagen supera los 2 MB');
    }

    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    const metadata = await sharp(file.buffer).metadata();
    const resized = await sharp(file.buffer)
      .resize({ width: Math.min(metadata.width ?? 1200, 1200), withoutEnlargement: true })
      .toBuffer();

    await fs.promises.writeFile(filePath, resized);

    return this.prisma.media.create({
      data: {
        restaurantId,
        filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: resized.length,
        width: metadata.width,
        height: metadata.height,
        url: `/uploads/${filename}`,
      },
    });
  }

  async findById(id: number) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) throw new NotFoundException('Archivo no encontrado');
    return media;
  }

  async remove(id: number) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) throw new NotFoundException('Archivo no encontrado');

    const filePath = path.join(UPLOAD_DIR, media.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.prisma.productMedia.deleteMany({ where: { mediaId: id } });
    return this.prisma.media.delete({ where: { id } });
  }
}