const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function upsertRestaurant(slug, data) {
  const existing = await prisma.restaurant.findUnique({ where: { slug } });
  if (existing) return existing;
  return prisma.restaurant.create({ data });
}

async function main() {
  const restaurant = await upsertRestaurant('mi-restaurante', { name: 'Mi Restaurante', slug: 'mi-restaurante' });

  const existingUser = await prisma.user.findUnique({ where: { email: 'admin@restaurante.com' } });
  if (!existingUser) {
    const password = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: { restaurantId: restaurant.id, name: 'Admin', email: 'admin@restaurante.com', passwordHash: password, role: 'admin_global' },
    });
  }

  const existingPage = await prisma.page.findFirst({ where: { slug: 'sede-principal' } });

  if (existingPage) {
    console.log('Seed data already exists');

    return;
  }

  const page = await prisma.page.create({
    data: { restaurantId: restaurant.id, name: 'Sede Principal', slug: 'sede-principal' },
  });

  await prisma.design.create({
    data: { pageId: page.id, headerType: 'color', headerValue: '#1e293b', title: 'Mi Restaurante', description: 'La mejor experiencia gastronómica' },
  });

  const menu = await prisma.menu.create({
    data: { pageId: page.id, name: 'Carta Principal', type: 'READ_ONLY', language: 'es' },
  });

  await prisma.pageElement.create({
    data: { pageId: page.id, menuId: menu.id, name: 'Nuestra Carta', sortOrder: 0 },
  });

  const cat1 = await prisma.category.create({ data: { menuId: menu.id, name: 'Entradas', sortOrder: 0 } });
  const cat2 = await prisma.category.create({ data: { menuId: menu.id, name: 'Platos Fuertes', sortOrder: 1 } });

  await prisma.product.create({
    data: { categoryId: cat1.id, name: 'Ceviche Mixto', description: 'Ceviche de pescado y camarón', sortOrder: 0, prices: { create: [{ name: 'Porción', value: 12.5 }] } },
  });

  await prisma.product.create({
    data: { categoryId: cat1.id, name: 'Empanadas', description: 'Empanadas de carne (4 unidades)', sortOrder: 1, prices: { create: [{ name: '', value: 8.0 }] } },
  });

  await prisma.product.create({
    data: { categoryId: cat2.id, name: 'Lomo Saltado', sortOrder: 0, prices: { create: [{ name: '', value: 15.0 }] } },
  });

  console.log('Seed completed successfully');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());