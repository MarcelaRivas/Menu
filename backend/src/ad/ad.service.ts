import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(restaurantId?: number) {
    const where = restaurantId ? { restaurantId } : {};
    return this.prisma.ad.findMany({
      where,
      include: { publishedAds: { include: { page: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: number) {
    return this.prisma.ad.findUnique({
      where: { id },
      include: { publishedAds: { include: { page: true } } },
    });
  }

  create(data: { restaurantId: number; name?: string; type?: string; mediaId?: number | null; videoUrl?: string | null; text?: string | null; config?: Record<string, unknown> | null; startsAt?: string | null; endsAt?: string | null }) {
    return this.prisma.ad.create({ data: this.toData(data) as any });
  }

  update(id: number, data: { name?: string; type?: string; mediaId?: number | null; videoUrl?: string | null; text?: string | null; active?: boolean; config?: Record<string, unknown> | null; startsAt?: string | null; endsAt?: string | null }) {
    return this.prisma.ad.update({ where: { id }, data: this.toData(data) as any });
  }

  /** Convierte fechas en texto a Date y deja null donde corresponda. */
  private toData(data: Record<string, any>) {
    const { startsAt, endsAt, ...rest } = data;
    return {
      ...rest,
      type: rest.type as any,
      ...(startsAt !== undefined ? { startsAt: startsAt ? new Date(startsAt) : null } : {}),
      ...(endsAt !== undefined ? { endsAt: endsAt ? new Date(endsAt) : null } : {}),
    };
  }

  async remove(id: number) {
    const ad = await this.prisma.ad.findUnique({
      where: { id },
      include: { publishedAds: true },
    });
    if (!ad) throw new NotFoundException('Anuncio no encontrado');

    if (ad.publishedAds.length > 0) {
      throw new ConflictException(
        'El anuncio está publicado en una o más sedes. Quítalo de todas antes de eliminarlo.',
      );
    }

    return this.prisma.ad.delete({ where: { id } });
  }

  async publish(id: number, data: { pageId: number; sortOrder?: number; showAfterSeconds?: number }) {
    const ad = await this.prisma.ad.findUnique({ where: { id } });
    if (!ad) throw new NotFoundException('Anuncio no encontrado');

    const already = await this.prisma.publishedAd.findFirst({ where: { adId: id, pageId: data.pageId } });
    if (already) throw new ConflictException('Este anuncio ya está publicado en esa sede');

    return this.prisma.publishedAd.create({
      data: {
        adId: id,
        pageId: data.pageId,
        sortOrder: data.sortOrder ?? 0,
        showAfterSeconds: data.showAfterSeconds ?? 0,
      },
      include: { page: true },
    });
  }

  async unpublish(publishedAdId: number) {
    return this.prisma.publishedAd.delete({ where: { id: publishedAdId } });
  }
}