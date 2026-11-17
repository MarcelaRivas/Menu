import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PageService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.page.findMany({
      include: { design: true },
      orderBy: { name: 'asc' },
    });
  }

  findById(id: number) {
    return this.prisma.page.findUnique({
      where: { id },
      include: { design: true, menus: true, publishedAds: true },
    });
  }

  findBySlug(slug: string, restaurantId?: number) {
    return this.prisma.page.findFirst({
      where: restaurantId ? { slug, restaurantId } : { slug },
    });
  }

  create(data: {
    restaurantId: number;
    name: string;
    slug: string;
    contactInfo?: string;
  }) {
    return this.prisma.page.create({ data });
  }

  update(
    id: number,
    data: { name?: string; slug?: string; contactInfo?: string; active?: boolean },
  ) {
    return this.prisma.page.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.page.delete({ where: { id } });
  }

  async updateDesign(
    id: number,
    data: {
      headerType?: string;
      headerValue?: string;
      logoMediaId?: number | null;
      logoSize?: number;
      title?: string;
      description?: string;
      font?: string;
      fontSize?: number;
      buttonFillColor?: string;
      buttonShadow?: string;
      buttonBorder?: string;
      showIcons?: boolean;
      backgroundMediaId?: number | null;
      backgroundBrightness?: number;
      buttonShape?: string;
      buttonSize?: string;
      buttonTextColor?: string;
      buttonFillOpacity?: number;
      buttonBorderColor?: string;
      buttonShadowColor?: string;
      buttonShadowOpacity?: number;
    },
  ) {
    const page = await this.prisma.page.findUnique({ where: { id }, include: { design: true } });
    if (!page) throw new NotFoundException('Sede no encontrada');

    if (page.design) {
      return this.prisma.design.update({ where: { pageId: id }, data });
    }
    return this.prisma.design.create({ data: { ...data, pageId: id } });
  }
}