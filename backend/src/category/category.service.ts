import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  /** Categorías de una carta: activas por defecto, o las de la papelera si trashed=true. */
  findAll(menuId?: number, trashed = false) {
    const where = { ...(menuId ? { menuId } : {}), deletedAt: trashed ? { not: null } : null };
    return this.prisma.category.findMany({
      where,
      include: {
        children: { where: { deletedAt: trashed ? { not: null } : null } },
        products: { where: { deletedAt: trashed ? { not: null } : null } },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  findById(id: number) {
    return this.prisma.category.findUnique({
      where: { id },
      include: { children: { include: { products: { where: { deletedAt: null } } } }, products: { where: { deletedAt: null } }, parent: true },
    });
  }

  create(data: {
    menuId: number;
    parentId?: number | null;
    name: string;
    description?: string;
    imageMediaId?: number | null;
    sortOrder?: number;
    visibility?: string;
    style?: string;
    columns?: number;
    navigation?: string;
    centerContent?: boolean;
    hideTitle?: boolean;
    hideProductTitles?: boolean;
    descriptionEllipsis?: boolean;
  }) {
    return this.prisma.category.create({ data: { ...data, visibility: data.visibility as any, style: data.style as any, navigation: data.navigation as any } });
  }

  update(
    id: number,
    data: {
      parentId?: number | null;
      name?: string;
      description?: string;
      imageMediaId?: number | null;
      sortOrder?: number;
      visibility?: string;
      style?: string;
      columns?: number;
      navigation?: string;
      centerContent?: boolean;
      hideTitle?: boolean;
      hideProductTitles?: boolean;
      descriptionEllipsis?: boolean;
    },
  ) {
    return this.prisma.category.update({ where: { id }, data: { ...data, visibility: data.visibility as any, style: data.style as any, navigation: data.navigation as any, parentId: data.parentId as any } });
  }

  /** Borra productos y todo lo que depende de ellos (precios, rangos, modificadores, imágenes, etiquetas). */
  private async removeProductsOf(categoryIds: number[]) {
    const products = await this.prisma.product.findMany({ where: { categoryId: { in: categoryIds } }, select: { id: true } });
    const productIds = products.map((p) => p.id);
    if (productIds.length === 0) return;
    const modifiers = await this.prisma.modifier.findMany({ where: { productId: { in: productIds } }, select: { id: true } });
    await this.prisma.modifierOption.deleteMany({ where: { modifierId: { in: modifiers.map((m) => m.id) } } });
    await this.prisma.modifier.deleteMany({ where: { productId: { in: productIds } } });
    await this.prisma.productPrice.deleteMany({ where: { productId: { in: productIds } } });
    await this.prisma.priceRange.deleteMany({ where: { productId: { in: productIds } } });
    await this.prisma.productMedia.deleteMany({ where: { productId: { in: productIds } } });
    await this.prisma.productTag.deleteMany({ where: { productId: { in: productIds } } });
    await this.prisma.product.deleteMany({ where: { id: { in: productIds } } });
  }

  /** Mueve la categoría, sus subcategorías y sus productos a la papelera (misma fecha, para restaurar juntos). */
  async remove(id: number) {
    const now = new Date();
    const children = await this.prisma.category.findMany({ where: { parentId: id, deletedAt: null }, select: { id: true } });
    const ids = [id, ...children.map((c) => c.id)];
    await this.prisma.product.updateMany({ where: { categoryId: { in: ids }, deletedAt: null }, data: { deletedAt: now } });
    await this.prisma.category.updateMany({ where: { id: { in: ids }, deletedAt: null }, data: { deletedAt: now } });
    return this.prisma.category.findUnique({ where: { id } });
  }

  /** Saca una categoría de la papelera junto con lo que se movió con ella. */
  async restore(id: number) {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat || !cat.deletedAt) throw new NotFoundException('La categoría no está en la papelera');
    const ts = cat.deletedAt;
    await this.prisma.category.updateMany({ where: { parentId: id, deletedAt: ts }, data: { deletedAt: null } });
    const ids = [id, ...(await this.prisma.category.findMany({ where: { parentId: id }, select: { id: true } })).map((c) => c.id)];
    await this.prisma.product.updateMany({ where: { categoryId: { in: ids }, deletedAt: ts }, data: { deletedAt: null } });
    return this.prisma.category.update({ where: { id }, data: { deletedAt: null } });
  }

  /** Borrado definitivo: solo para categorías que ya están en la papelera. */
  async permanentRemove(id: number) {
    const cat = await this.prisma.category.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Categoría no encontrada');
    if (!cat.deletedAt) throw new BadRequestException('Primero mueve la categoría a la papelera');
    const children = await this.prisma.category.findMany({ where: { parentId: id }, select: { id: true } });
    await this.removeProductsOf([id, ...children.map((c) => c.id)]);
    await this.prisma.category.deleteMany({ where: { parentId: id } });
    return this.prisma.category.delete({ where: { id } });
  }

  async duplicate(id: number) {
    const source = await this.prisma.category.findUnique({
      where: { id },
      include: { children: { where: { deletedAt: null }, include: { products: { where: { deletedAt: null } } } }, products: { where: { deletedAt: null } } },
    });
    if (!source) throw new NotFoundException('Categoría no encontrada');

    const newCat = await this.prisma.category.create({
      data: {
        menuId: source.menuId,
        parentId: source.parentId,
        name: `${source.name} (copia)`,
        description: source.description,
        imageMediaId: source.imageMediaId,
        sortOrder: source.sortOrder,
        visibility: source.visibility,
        style: source.style,
        columns: source.columns,
        navigation: source.navigation,
        centerContent: source.centerContent,
        hideTitle: source.hideTitle,
        hideProductTitles: source.hideProductTitles,
        descriptionEllipsis: source.descriptionEllipsis,
      },
    });

    for (const product of source.products) {
      await this.prisma.product.create({
        data: {
          categoryId: newCat.id,
          name: product.name,
          description: product.description,
          type: product.type,
          visibility: product.visibility,
          hidePrices: product.hidePrices,
          recommended: product.recommended,
          isNew: product.isNew,
          soldOut: product.soldOut,
          preparationTime: product.preparationTime,
          timePerUnit: product.timePerUnit,
          productType1: product.productType1,
          productType2: product.productType2,
          productType3: product.productType3,
          productType4: product.productType4,
          link: product.link,
          sortOrder: product.sortOrder,
        },
      });
    }

    for (const child of source.children) {
      await this.duplicateChild(child, newCat.id);
    }

    return this.findById(newCat.id);
  }

  private async duplicateChild(source: any, newParentId: number) {
    const newCat = await this.prisma.category.create({
      data: {
        menuId: source.menuId,
        parentId: newParentId,
        name: `${source.name} (copia)`,
        description: source.description,
        imageMediaId: source.imageMediaId,
        sortOrder: source.sortOrder,
        visibility: source.visibility,
        style: source.style,
        columns: source.columns,
        navigation: source.navigation,
        centerContent: source.centerContent,
        hideTitle: source.hideTitle,
        hideProductTitles: source.hideProductTitles,
        descriptionEllipsis: source.descriptionEllipsis,
      },
    });

    for (const product of source.products) {
      await this.prisma.product.create({
        data: {
          categoryId: newCat.id,
          name: product.name,
          description: product.description,
          type: product.type,
          visibility: product.visibility,
          hidePrices: product.hidePrices,
          recommended: product.recommended,
          isNew: product.isNew,
          soldOut: product.soldOut,
          preparationTime: product.preparationTime,
          timePerUnit: product.timePerUnit,
          productType1: product.productType1,
          productType2: product.productType2,
          productType3: product.productType3,
          productType4: product.productType4,
          link: product.link,
          sortOrder: product.sortOrder,
        },
      });
    }

    for (const child of source.children) {
      await this.duplicateChild(child, newCat.id);
    }
  }

  async copyToMenu(id: number, menuId: number) {
    const source = await this.prisma.category.findUnique({
      where: { id },
      include: { children: { where: { deletedAt: null }, include: { products: { where: { deletedAt: null } } } }, products: { where: { deletedAt: null } } },
    });
    if (!source) throw new NotFoundException('Categoría no encontrada');

    const newCat = await this.prisma.category.create({
      data: {
        menuId,
        parentId: null as any,
        name: source.name,
        description: source.description,
        imageMediaId: source.imageMediaId,
        sortOrder: source.sortOrder,
        visibility: source.visibility,
        style: source.style,
        columns: source.columns,
        navigation: source.navigation,
        centerContent: source.centerContent,
        hideTitle: source.hideTitle,
        hideProductTitles: source.hideProductTitles,
        descriptionEllipsis: source.descriptionEllipsis,
      },
    });

    for (const product of source.products) {
      await this.prisma.product.create({
        data: {
          categoryId: newCat.id,
          name: product.name,
          description: product.description,
          type: product.type,
          visibility: product.visibility,
          hidePrices: product.hidePrices,
          recommended: product.recommended,
          isNew: product.isNew,
          soldOut: product.soldOut,
          preparationTime: product.preparationTime,
          timePerUnit: product.timePerUnit,
          productType1: product.productType1,
          productType2: product.productType2,
          productType3: product.productType3,
          productType4: product.productType4,
          link: product.link,
          sortOrder: product.sortOrder,
        },
      });
    }

    for (const child of source.children) {
      await this.duplicateChildToMenu(child, newCat.id, menuId);
    }

    return this.findById(newCat.id);
  }

  private async duplicateChildToMenu(source: any, newParentId: number, menuId: number) {
    const newCat = await this.prisma.category.create({
      data: {
        menuId,
        parentId: newParentId,
        name: source.name,
        description: source.description,
        imageMediaId: source.imageMediaId,
        sortOrder: source.sortOrder,
        visibility: source.visibility,
        style: source.style,
        columns: source.columns,
        navigation: source.navigation,
        centerContent: source.centerContent,
        hideTitle: source.hideTitle,
        hideProductTitles: source.hideProductTitles,
        descriptionEllipsis: source.descriptionEllipsis,
      },
    });

    for (const product of source.products) {
      await this.prisma.product.create({
        data: {
          categoryId: newCat.id,
          name: product.name,
          description: product.description,
          type: product.type,
          visibility: product.visibility,
          hidePrices: product.hidePrices,
          recommended: product.recommended,
          isNew: product.isNew,
          soldOut: product.soldOut,
          preparationTime: product.preparationTime,
          timePerUnit: product.timePerUnit,
          productType1: product.productType1,
          productType2: product.productType2,
          productType3: product.productType3,
          productType4: product.productType4,
          link: product.link,
          sortOrder: product.sortOrder,
        },
      });
    }

    for (const child of source.children) {
      await this.duplicateChildToMenu(child, newCat.id, menuId);
    }
  }

  async bulkUpdate(ids: number[], data: {
    visibility?: string;
    style?: string;
    columns?: number;
    descriptionEllipsis?: boolean;
    centerContent?: boolean;
    hideTitle?: boolean;
    hideProductTitles?: boolean;
  }) {
    return this.prisma.category.updateMany({
      where: { id: { in: ids } },
      data: { ...data, visibility: data.visibility as any, style: data.style as any },
    });
  }

  /** Mueve varias categorías a la papelera. */
  async bulkDelete(ids: number[]) {
    for (const id of ids) await this.remove(id);
    return { moved: ids.length };
  }
}