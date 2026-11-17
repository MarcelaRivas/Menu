import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  /** Restaurante por su slug, con sus sedes activas. */
  async getRestaurantBySlug(restaurantSlug: string) {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { slug: restaurantSlug, active: true },
      include: {
        pages: {
          where: { active: true },
          select: { id: true, name: true, slug: true, contactInfo: true, design: { select: { title: true, description: true, headerValue: true, backgroundMediaId: true, backgroundBrightness: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!restaurant) throw new NotFoundException('Restaurante no encontrado');
    const design = await this.prisma.restaurantDesign.findUnique({ where: { restaurantId: restaurant.id } });
    const bg = design?.backgroundMediaId
      ? await this.prisma.media.findUnique({ where: { id: design.backgroundMediaId } })
      : null;
    // Cada sede lleva la URL de la imagen de fondo de su diseño (para la tarjeta en la página del restaurante).
    const pages = await Promise.all(
      restaurant.pages.map(async (p) => {
        const id = p.design?.backgroundMediaId;
        const media = id ? await this.prisma.media.findUnique({ where: { id } }) : null;
        return { ...p, backgroundUrl: media?.url ?? null };
      }),
    );
    return {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      design,
      backgroundUrl: bg?.url ?? null,
      pages,
    };
  }

  /** Sede de un restaurante, por el slug del restaurante y el de la sede. */
  async getPageBySlug(restaurantSlug: string, slug: string) {
    const page = await this.prisma.page.findFirst({
      where: { slug, active: true, restaurant: { slug: restaurantSlug, active: true } },
      include: {
        design: true,
        restaurant: { select: { name: true } },
        elements: {
          where: { active: true },
          include: { menu: true },
          orderBy: { sortOrder: 'asc' },
        },
        // Cartas visibles de la sede: se usan cuando la sede no tiene elementos configurados.
        menus: {
          where: { active: true, visibility: 'VISIBLE' },
          select: { id: true, name: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!page) throw new NotFoundException('Sede no encontrada');

    // URL de la imagen de fondo del diseño (si la hay).
    const bgId = page.design?.backgroundMediaId;
    const background = bgId ? await this.prisma.media.findUnique({ where: { id: bgId } }) : null;

    // Anuncios publicados en la sede: activos y dentro de su vigencia.
    const now = new Date();
    const published = await this.prisma.publishedAd.findMany({
      where: {
        pageId: page.id,
        ad: {
          active: true,
          AND: [
            { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
            { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
          ],
        },
      },
      include: { ad: true },
      orderBy: { sortOrder: 'asc' },
    });
    const ads = await Promise.all(
      published.map(async (p) => {
        const ad = p.ad;
        const media = ad.mediaId ? await this.prisma.media.findUnique({ where: { id: ad.mediaId } }) : null;
        const config = (ad.config ?? {}) as Record<string, any>;
        let product: { id: number; name: string; description: string; prices: { name: string; value: unknown }[] } | null = null;
        if (config.productId) {
          const pr = await this.prisma.product.findUnique({
            where: { id: Number(config.productId) },
            include: { prices: true },
          });
          if (pr) product = { id: pr.id, name: pr.name, description: pr.description, prices: pr.prices };
        }
        return {
          id: ad.id,
          type: ad.type,
          name: ad.name,
          text: p.ad.text,
          imageUrl: media?.url ?? null,
          videoUrl: ad.videoUrl,
          config,
          product,
          showAfterSeconds: p.showAfterSeconds,
        };
      }),
    );

    return { ...page, backgroundUrl: background?.url ?? null, ads };
  }

  async getMenu(id: number) {
    const menu = await this.prisma.menu.findUnique({
      where: { id, active: true, visibility: 'VISIBLE' },
      include: {
        categories: {
          where: { parentId: null, visibility: 'VISIBLE', deletedAt: null },
          include: {
            children: { where: { visibility: 'VISIBLE', deletedAt: null }, include: { products: { where: { visibility: 'VISIBLE', deletedAt: null }, include: { prices: true, productMedia: { orderBy: { sortOrder: 'asc' }, take: 1, include: { media: true } } }, orderBy: { sortOrder: 'asc' } } }, orderBy: { sortOrder: 'asc' } },
            products: { where: { visibility: 'VISIBLE', deletedAt: null }, include: { prices: true, productMedia: { orderBy: { sortOrder: 'asc' }, take: 1, include: { media: true } } }, orderBy: { sortOrder: 'asc' } },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    if (!menu) throw new NotFoundException('Carta no encontrada');

    // Cada categoría lleva la URL de su imagen (si la tiene).
    const categories = await Promise.all(
      menu.categories.map(async (c) => {
        const media = c.imageMediaId ? await this.prisma.media.findUnique({ where: { id: c.imageMediaId } }) : null;
        return { ...c, imageUrl: media?.url ?? null };
      }),
    );
    return { ...menu, categories };
  }
}