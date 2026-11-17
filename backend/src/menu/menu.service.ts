import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.menu.findMany({
      include: { categories: { where: { deletedAt: null }, include: { children: { where: { deletedAt: null } } } } },
      orderBy: { name: 'asc' },
    });
  }

  findById(id: number) {
    return this.prisma.menu.findUnique({
      where: { id },
      include: {
        categories: {
          where: { parentId: null, deletedAt: null },
          include: {
            children: { where: { deletedAt: null }, include: { products: { where: { deletedAt: null } } } },
            products: { where: { deletedAt: null } },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  create(data: { pageId: number; name: string; type?: string; visibility?: string; language?: string }) {
    return this.prisma.menu.create({ data: { ...data, type: data.type as any, visibility: data.visibility as any } });
  }

  update(id: number, data: { name?: string; type?: string; visibility?: string; language?: string; active?: boolean; hasSchedule?: boolean; deliveryEnabled?: boolean; pickupEnabled?: boolean; dineInEnabled?: boolean }) {
    return this.prisma.menu.update({ where: { id }, data: { ...data, type: data.type as any, visibility: data.visibility as any } });
  }

  async remove(id: number) {
    const categories = await this.prisma.category.findMany({ where: { menuId: id } });
    for (const cat of categories) {
      await this.prisma.product.deleteMany({ where: { categoryId: cat.id } });
    }
    await this.prisma.category.deleteMany({ where: { menuId: id } });
    await this.prisma.pageElement.deleteMany({ where: { menuId: id } });
    return this.prisma.menu.delete({ where: { id } });
  }

  async duplicate(id: number) {
    const source = await this.prisma.menu.findUnique({
      where: { id },
      include: {
        categories: {
          where: { parentId: null },
          include: { children: { include: { products: true } }, products: true },
        },
      },
    });
    if (!source) throw new NotFoundException('Carta no encontrada');

    const menu = await this.prisma.menu.create({
      data: { pageId: source.pageId, name: `${source.name} (copia)`, type: source.type, visibility: source.visibility, language: source.language },
    });

    for (const cat of source.categories) {
      await this.duplicateCategory(cat, menu.id, null);
    }

    return this.findById(menu.id);
  }

  private async duplicateCategory(cat: any, menuId: number, newParentId: number | null) {
    const newCat = await this.prisma.category.create({
      data: {
        menuId,
        parentId: newParentId,
        name: cat.name,
        description: cat.description,
        imageMediaId: cat.imageMediaId,
        sortOrder: cat.sortOrder,
        visibility: cat.visibility,
        style: cat.style,
        columns: cat.columns,
        navigation: cat.navigation,
        centerContent: cat.centerContent,
        hideTitle: cat.hideTitle,
        hideProductTitles: cat.hideProductTitles,
        descriptionEllipsis: cat.descriptionEllipsis,
      },
    });

    for (const product of cat.products) {
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

    for (const child of cat.children) {
      await this.duplicateCategory(child, menuId, newCat.id);
    }
  }

  async replace(sourceId: number, destinationId: number) {
    const source = await this.prisma.menu.findUnique({ where: { id: sourceId } });
    const dest = await this.prisma.menu.findUnique({ where: { id: destinationId } });
    if (!source || !dest) throw new NotFoundException('Carta no encontrada');

    await this.removeAllCategories(destinationId);

    const sourceCategories = await this.prisma.category.findMany({
      where: { menuId: sourceId, parentId: null },
      include: { children: { include: { products: true } }, products: true },
    });

    for (const cat of sourceCategories) {
      await this.duplicateCategoryToMenu(cat, destinationId, null);
    }

    return this.findById(destinationId);
  }

  private async removeAllCategories(menuId: number) {
    const categories = await this.prisma.category.findMany({ where: { menuId } });
    for (const cat of categories) {
      await this.prisma.product.deleteMany({ where: { categoryId: cat.id } });
    }
    await this.prisma.category.deleteMany({ where: { menuId } });
  }

  private async duplicateCategoryToMenu(cat: any, menuId: number, newParentId: number | null) {
    const newCat = await this.prisma.category.create({
      data: {
        menuId,
        parentId: newParentId,
        name: cat.name,
        description: cat.description,
        imageMediaId: cat.imageMediaId,
        sortOrder: cat.sortOrder,
        visibility: cat.visibility,
        style: cat.style,
        columns: cat.columns,
        navigation: cat.navigation,
        centerContent: cat.centerContent,
        hideTitle: cat.hideTitle,
        hideProductTitles: cat.hideProductTitles,
        descriptionEllipsis: cat.descriptionEllipsis,
      },
    });

    for (const product of cat.products) {
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

    for (const child of cat.children) {
      await this.duplicateCategoryToMenu(child, menuId, newCat.id);
    }
  }

  async copyToPage(id: number, pageId: number) {
    const source = await this.prisma.menu.findUnique({
      where: { id },
      include: {
        categories: {
          where: { parentId: null },
          include: { children: { include: { products: true } }, products: true },
        },
      },
    });
    if (!source) throw new NotFoundException('Carta de origen no encontrada');

    const existing = await this.prisma.menu.findFirst({ where: { pageId, name: source.name } });
    const name = existing ? `${source.name} (copia)` : source.name;

    const menu = await this.prisma.menu.create({
      data: { pageId, name, type: source.type, visibility: source.visibility, language: source.language },
    });

    for (const cat of source.categories) {
      await this.duplicateCategory(cat, menu.id, null);
    }

    return this.prisma.menu.findUnique({
      where: { id: menu.id },
      include: {
        categories: {
          where: { parentId: null },
          include: { children: true, products: true },
        },
      },
    });
  }
}