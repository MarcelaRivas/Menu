import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/*
 * Los datos que llegan del frontend pueden traer campos de relación o de
 * identidad (id, productId, modifierId) porque se reenvían objetos leídos de la
 * API. Prisma rechaza esos campos dentro de createMany, así que se normalizan
 * aquí a solo las columnas que se escriben.
 */
function cleanPrices(prices: { name?: string; value: number | string; sortOrder?: number }[]) {
  return prices.map((p) => ({
    name: p.name ?? '',
    value: Number(p.value) || 0,
    sortOrder: p.sortOrder ?? 0,
  }));
}

function cleanPriceRanges(ranges: { fromQuantity: number; toQuantity?: number | null; price: number | string }[]) {
  return ranges.map((r) => ({
    fromQuantity: Number(r.fromQuantity),
    toQuantity: r.toQuantity ?? null,
    price: Number(r.price) || 0,
  }));
}

function cleanOptions(options: { name: string; price?: number | string; sortOrder?: number }[]) {
  return options.map((o) => ({
    name: o.name,
    price: Number(o.price) || 0,
    sortOrder: o.sortOrder ?? 0,
  }));
}

/* ---------- Historial de cambios ---------- */

/** Campos escalares de producto que se registran en el historial. */
const TRACKED_SCALARS = [
  'code', 'name', 'description', 'type', 'visibility', 'hidePrices', 'recommended', 'isNew',
  'soldOut', 'preparationTime', 'timePerUnit', 'productType1', 'productType2',
  'productType3', 'productType4', 'link', 'sortOrder',
] as const;

interface HistoryChange { fieldName: string; oldValue: string; newValue: string }

function asText(v: unknown): string {
  return v === null || v === undefined ? '' : String(v);
}

function pricesText(list: { name?: string | null; value: unknown }[]): string {
  return list.map((p) => `${p.name ? `${p.name}: ` : ''}$${Number(p.value)}`).join(' | ');
}

function modifiersText(list: { name: string; options?: { name: string }[] }[]): string {
  return list
    .map((m) => (m.options?.length ? `${m.name} (${m.options.map((o) => o.name).join(', ')})` : m.name))
    .join(' | ');
}

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  /** Productos de una categoría: activos por defecto, o los de la papelera si trashed=true. */
  findAll(categoryId?: number, trashed = false) {
    const where = { ...(categoryId ? { categoryId } : {}), deletedAt: trashed ? { not: null } : null };
    return this.prisma.product.findMany({
      where,
      include: { prices: { orderBy: { sortOrder: 'asc' } }, priceRanges: true, modifiers: { include: { options: true } }, productMedia: { include: { media: true } }, productTags: { include: { tag: true } } },
      orderBy: { sortOrder: 'asc' },
    });
  }

  findById(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { prices: { orderBy: { sortOrder: 'asc' } }, priceRanges: true, modifiers: { include: { options: { orderBy: { sortOrder: 'asc' } } }, orderBy: { sortOrder: 'asc' } }, productMedia: { include: { media: true }, orderBy: { sortOrder: 'asc' } }, productTags: { include: { tag: true } } },
    });
  }

  async create(data: {
    categoryId: number;
    code?: string | null;
    name: string;
    description?: string;
    type?: string;
    visibility?: string;
    hidePrices?: boolean;
    recommended?: boolean;
    isNew?: boolean;
    soldOut?: boolean;
    preparationTime?: number | null;
    timePerUnit?: boolean;
    productType1?: string | null;
    productType2?: string | null;
    productType3?: string | null;
    productType4?: string | null;
    link?: string | null;
    sortOrder?: number;
    prices?: { name?: string; value: number; sortOrder?: number }[];
    priceRanges?: { fromQuantity: number; toQuantity?: number | null; price: number }[];
    modifiers?: {
      name: string; type?: string; required?: boolean; min?: number; max?: number; sortOrder?: number;
      options?: { name: string; price?: number; sortOrder?: number }[];
    }[];
    productMedia?: { mediaId: number; sortOrder?: number }[];
    tagIds?: number[];
  }, userId?: number) {
    const created = await this.prisma.product.create({
      data: {
        categoryId: data.categoryId,
        code: data.code ?? null,
        name: data.name,
        description: data.description,
        type: data.type as any,
        visibility: data.visibility as any,
        hidePrices: data.hidePrices,
        recommended: data.recommended,
        isNew: data.isNew,
        soldOut: data.soldOut,
        preparationTime: data.preparationTime,
        timePerUnit: data.timePerUnit,
        productType1: data.productType1,
        productType2: data.productType2,
        productType3: data.productType3,
        productType4: data.productType4,
        link: data.link,
        sortOrder: data.sortOrder,
        prices: data.prices ? { createMany: { data: cleanPrices(data.prices) } } : undefined,
        priceRanges: data.priceRanges ? { createMany: { data: cleanPriceRanges(data.priceRanges) } } : undefined,
        modifiers: data.modifiers ? {
          create: data.modifiers.map((m) => ({
            name: m.name,
            type: m.type as any,
            required: m.required,
            min: m.min,
            max: m.max,
            sortOrder: m.sortOrder,
            options: m.options ? { createMany: { data: cleanOptions(m.options) } } : undefined,
          })),
        } : undefined,
        productTags: data.tagIds ? { create: data.tagIds.map((tagId) => ({ tagId })) } : undefined,
        productMedia: data.productMedia ? {
          create: data.productMedia.map((pm) => ({
            mediaId: pm.mediaId,
            sortOrder: pm.sortOrder ?? 0,
          })),
        } : undefined,
      },
      include: { prices: true, priceRanges: true, modifiers: { include: { options: true } }, productMedia: { include: { media: true } }, productTags: { include: { tag: true } } },
    });
    await this.prisma.history.create({
      data: { entityType: 'PRODUCT', entityId: created.id, entityName: created.name, action: 'CREATE', userId: userId ?? null },
    });
    return created;
  }

  async update(
    id: number,
    data: {
      name?: string;
      description?: string;
      type?: string;
      visibility?: string;
      hidePrices?: boolean;
      recommended?: boolean;
      isNew?: boolean;
      soldOut?: boolean;
      preparationTime?: number | null;
      timePerUnit?: boolean;
      productType1?: string | null;
      productType2?: string | null;
      productType3?: string | null;
      productType4?: string | null;
      link?: string | null;
      sortOrder?: number;
      prices?: { name?: string; value: number; sortOrder?: number }[];
      priceRanges?: { fromQuantity: number; toQuantity?: number | null; price: number }[];
      modifiers?: {
        name: string; type?: string; required?: boolean; min?: number; max?: number; sortOrder?: number;
        options?: { name: string; price?: number; sortOrder?: number }[];
      }[];
      productMedia?: { mediaId: number; sortOrder?: number }[];
      tagIds?: number[];
      categoryId?: number;
    },
    userId?: number,
  ) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { prices: true, modifiers: { include: { options: true } } },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');

    const { prices, priceRanges, modifiers, productMedia, tagIds, ...scalars } = data;

    // Cambios a registrar en el historial (se calculan antes de escribir).
    const changes: HistoryChange[] = [];
    const before = product as unknown as Record<string, unknown>;
    const incoming = scalars as unknown as Record<string, unknown>;
    for (const key of TRACKED_SCALARS) {
      if (!(key in incoming)) continue;
      const oldV = asText(before[key]);
      const newV = asText(incoming[key]);
      if (oldV !== newV) changes.push({ fieldName: key, oldValue: oldV, newValue: newV });
    }
    if (prices) {
      const oldV = pricesText(product.prices);
      const newV = pricesText(cleanPrices(prices));
      if (oldV !== newV) changes.push({ fieldName: 'prices', oldValue: oldV, newValue: newV });
    }
    if (modifiers) {
      const oldV = modifiersText(product.modifiers);
      const newV = modifiersText(modifiers);
      if (oldV !== newV) changes.push({ fieldName: 'modifiers', oldValue: oldV, newValue: newV });
    }

    if (prices) {
      await this.prisma.productPrice.deleteMany({ where: { productId: id } });
    }
    if (priceRanges) {
      await this.prisma.priceRange.deleteMany({ where: { productId: id } });
    }
    if (modifiers) {
      const existingMods = await this.prisma.modifier.findMany({ where: { productId: id } });
      for (const mod of existingMods) {
        await this.prisma.modifierOption.deleteMany({ where: { modifierId: mod.id } });
      }
      await this.prisma.modifier.deleteMany({ where: { productId: id } });
    }
    if (productMedia) {
      await this.prisma.productMedia.deleteMany({ where: { productId: id } });
    }
    if (tagIds) {
      await this.prisma.productTag.deleteMany({ where: { productId: id } });
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        ...scalars,
        type: scalars.type as any,
        visibility: scalars.visibility as any,
        prices: prices ? { createMany: { data: cleanPrices(prices) } } : undefined,
        priceRanges: priceRanges ? { createMany: { data: cleanPriceRanges(priceRanges) } } : undefined,
        modifiers: modifiers ? {
          create: modifiers.map((m) => ({
            name: m.name,
            type: m.type as any,
            required: m.required,
            min: m.min,
            max: m.max,
            sortOrder: m.sortOrder,
            options: m.options ? { createMany: { data: cleanOptions(m.options) } } : undefined,
          })),
        } : undefined,
        productTags: tagIds ? { create: tagIds.map((tagId) => ({ tagId })) } : undefined,
        productMedia: productMedia ? {
          create: productMedia.map((pm) => ({ mediaId: pm.mediaId, sortOrder: pm.sortOrder ?? 0 })),
        } : undefined,
      },
      include: { prices: true, priceRanges: true, modifiers: { include: { options: true } }, productMedia: { include: { media: true } }, productTags: { include: { tag: true } } },
    });

    if (changes.length > 0) {
      await this.prisma.history.createMany({
        data: changes.map((c) => ({
          entityType: 'PRODUCT',
          entityId: id,
          entityName: updated.name,
          action: 'EDIT' as const,
          userId: userId ?? null,
          fieldName: c.fieldName,
          oldValue: c.oldValue,
          newValue: c.newValue,
        })),
      });
    }
    return updated;
  }

  /** Mueve el producto a la papelera (se puede restaurar). */
  async remove(id: number, userId?: number) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Producto no encontrado');
    await this.prisma.product.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.prisma.history.create({
      data: { entityType: 'PRODUCT', entityId: id, entityName: existing.name, action: 'DELETE', userId: userId ?? null },
    });
    return { id, deleted: true };
  }

  /** Saca el producto de la papelera. */
  async restore(id: number) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing || !existing.deletedAt) throw new NotFoundException('El producto no está en la papelera');
    return this.prisma.product.update({ where: { id }, data: { deletedAt: null } });
  }

  /** Borrado definitivo: solo para productos que ya están en la papelera. */
  async permanentRemove(id: number, userId?: number) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Producto no encontrado');
    if (!existing.deletedAt) throw new BadRequestException('Primero mueve el producto a la papelera');
    await this.prisma.productPrice.deleteMany({ where: { productId: id } });
    await this.prisma.priceRange.deleteMany({ where: { productId: id } });
    const mods = await this.prisma.modifier.findMany({ where: { productId: id } });
    for (const mod of mods) {
      await this.prisma.modifierOption.deleteMany({ where: { modifierId: mod.id } });
    }
    await this.prisma.modifier.deleteMany({ where: { productId: id } });
    await this.prisma.productMedia.deleteMany({ where: { productId: id } });
    return this.prisma.product.delete({ where: { id } });
  }

  async duplicate(id: number) {
    const source = await this.prisma.product.findUnique({
      where: { id },
      include: { prices: true, priceRanges: true, modifiers: { include: { options: true } }, productMedia: true },
    });
    if (!source) throw new NotFoundException('Producto no encontrado');

    return this.prisma.product.create({
      data: {
        categoryId: source.categoryId,
        name: `${source.name} (copia)`,
        description: source.description,
        type: source.type,
        visibility: source.visibility,
        hidePrices: source.hidePrices,
        recommended: source.recommended,
        isNew: source.isNew,
        soldOut: source.soldOut,
        preparationTime: source.preparationTime,
        timePerUnit: source.timePerUnit,
        productType1: source.productType1,
        productType2: source.productType2,
        productType3: source.productType3,
        productType4: source.productType4,
        link: source.link,
        sortOrder: source.sortOrder,
        prices: { createMany: { data: source.prices.map((p) => ({ name: p.name, value: p.value, sortOrder: p.sortOrder })) } },
        priceRanges: { createMany: { data: source.priceRanges.map((r) => ({ fromQuantity: r.fromQuantity, toQuantity: r.toQuantity, price: r.price })) } },
        modifiers: {
          create: source.modifiers.map((m) => ({
            name: m.name,
            type: m.type,
            required: m.required,
            min: m.min,
            max: m.max,
            sortOrder: m.sortOrder,
            options: m.options.length > 0 ? { createMany: { data: m.options.map((o) => ({ name: o.name, price: o.price, sortOrder: o.sortOrder })) } } : undefined,
          })),
        },
        productMedia: {
          create: source.productMedia.map((pm) => ({ mediaId: pm.mediaId, sortOrder: pm.sortOrder })),
        },
      },
      include: { prices: true, priceRanges: true, modifiers: { include: { options: true } }, productMedia: { include: { media: true } }, productTags: { include: { tag: true } } },
    });
  }

  async moveToCategory(id: number, categoryId: number) {
    return this.prisma.product.update({
      where: { id },
      data: { categoryId },
      include: { prices: true, priceRanges: true, modifiers: { include: { options: true } }, productMedia: { include: { media: true } }, productTags: { include: { tag: true } } },
    });
  }

  async copyToCategory(id: number, categoryId: number) {
    const source = await this.prisma.product.findUnique({
      where: { id },
      include: { prices: true, priceRanges: true, modifiers: { include: { options: true } }, productMedia: true },
    });
    if (!source) throw new NotFoundException('Producto no encontrado');

    return this.prisma.product.create({
      data: {
        categoryId,
        name: source.name,
        description: source.description,
        type: source.type,
        visibility: source.visibility,
        hidePrices: source.hidePrices,
        recommended: source.recommended,
        isNew: source.isNew,
        soldOut: source.soldOut,
        preparationTime: source.preparationTime,
        timePerUnit: source.timePerUnit,
        productType1: source.productType1,
        productType2: source.productType2,
        productType3: source.productType3,
        productType4: source.productType4,
        link: source.link,
        sortOrder: source.sortOrder,
        prices: { createMany: { data: source.prices.map((p) => ({ name: p.name, value: p.value, sortOrder: p.sortOrder })) } },
        priceRanges: { createMany: { data: source.priceRanges.map((r) => ({ fromQuantity: r.fromQuantity, toQuantity: r.toQuantity, price: r.price })) } },
        modifiers: {
          create: source.modifiers.map((m) => ({
            name: m.name,
            type: m.type,
            required: m.required,
            min: m.min,
            max: m.max,
            sortOrder: m.sortOrder,
            options: m.options.length > 0 ? { createMany: { data: m.options.map((o) => ({ name: o.name, price: o.price, sortOrder: o.sortOrder })) } } : undefined,
          })),
        },
        productMedia: {
          create: source.productMedia.map((pm) => ({ mediaId: pm.mediaId, sortOrder: pm.sortOrder })),
        },
      },
      include: { prices: true, priceRanges: true, modifiers: { include: { options: true } }, productMedia: { include: { media: true } }, productTags: { include: { tag: true } } },
    });
  }

  async setSoldOut(id: number, soldOut: boolean) {
    return this.prisma.product.update({
      where: { id },
      data: { soldOut },
    });
  }
}