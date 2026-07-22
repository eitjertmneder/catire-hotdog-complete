import { PrismaService } from '../src/prisma/prisma.service';
import { BRANCHES } from './seed/branches.seed';
import { MENUS } from './seed/menus.seed';
import { PRODUCTS } from './seed/products.seed';

const prisma = new PrismaService();

const getCategoryName = (productName: string): string => {
  if (productName.includes('Perro')) return 'Perros';
  if (productName.includes('Hamburguesa')) return 'Hamburguesas';
  if (productName.includes('Salchipapa')) return 'Salchipapas';
  return 'Bebidas';
};

async function main() {
  for (const b of BRANCHES) {
    const branch = await prisma.branch.upsert({
      where: { name: b.name },
      update: {},
      create: {
        name: b.name,
        coordinates_long: b.coordinates_long,
        coordinates_lat: b.coordinates_lat,
      },
    });

    for (const m of MENUS) {
      const menu = await prisma.menu.upsert({
        where: { name: m.name },
        update: {},
        create: { name: m.name, branch_id: branch.id },
      });

      const isPromoMenu = m.name === 'Promociones';
      const productsForMenu = PRODUCTS.filter((p) =>
        isPromoMenu
          ? p.name.includes('Promocion')
          : !p.name.includes('Promocion'),
      );

      for (const p of productsForMenu) {
        const catName = getCategoryName(p.name);
        const category = await prisma.category.upsert({
          where: { name: catName },
          update: {},
          create: { name: catName },
        });

        await prisma.product.upsert({
          where: { name: p.name },
          update: {},
          create: {
            name: p.name,
            img_src: p.img_src,
            menu_id: menu.id,
            category_id: category.id,
          },
        });
      }
    }
  }

  console.log('Catalog seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
