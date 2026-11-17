import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RestaurantService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.restaurant.findMany({ include: { pages: true } });
  }

  findById(id: number) {
    return this.prisma.restaurant.findUnique({
      where: { id },
      include: { pages: { include: { design: true } } },
    });
  }

  findBySlug(slug: string) {
    return this.prisma.restaurant.findUnique({ where: { slug } });
  }

  create(data: { name: string; slug: string }) {
    return this.prisma.restaurant.create({ data });
  }

  update(id: number, data: { name?: string; slug?: string; active?: boolean }) {
    return this.prisma.restaurant.update({ where: { id }, data });
  }

  /** Diseño del restaurante; si aún no existe, devuelve null. */
  getDesign(restaurantId: number) {
    return this.prisma.restaurantDesign.findUnique({ where: { restaurantId } });
  }

  /** Crea o actualiza el diseño del restaurante. */
  updateDesign(restaurantId: number, data: Record<string, unknown>) {
    const allowed = [
      'headerType','headerValue','backgroundMediaId','backgroundBrightness','title','description','font','fontSize',
      'buttonFillColor','buttonFillOpacity','buttonTextColor','buttonShape','buttonSize','buttonBorderColor',
      'buttonShadowColor','buttonShadowOpacity','showIcons',
    ];
    const clean = Object.fromEntries(Object.entries(data).filter(([k]) => allowed.includes(k)));
    return this.prisma.restaurantDesign.upsert({
      where: { restaurantId },
      update: clean,
      create: { ...clean, restaurantId },
    });
  }

  remove(id: number) {
    return this.prisma.restaurant.delete({ where: { id } });
  }
}