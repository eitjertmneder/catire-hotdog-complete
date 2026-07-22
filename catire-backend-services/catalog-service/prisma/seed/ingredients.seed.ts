import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// All ingredients from the requirements document
const ingredients = [
  // ===== PERROS CALIENTES =====
  // Panes Perros
  { name: 'Pan Mini', name_tag: 'SIZE', category: 'Panes Perros', stock: 100 },
  { name: 'Pan Normal', name_tag: 'SIZE', category: 'Panes Perros', stock: 80 },

  // Toppings Perros
  { name: 'Queso', name_tag: 'TOPPINGS', category: 'Toppings Perros', stock: 5000 },
  { name: 'Papa', name_tag: 'TOPPINGS', category: 'Toppings Perros', stock: 8000 },
  { name: 'Zanahoria', name_tag: 'TOPPINGS', category: 'Toppings Perros', stock: 3000 },
  { name: 'Cebolla', name_tag: 'TOPPINGS', category: 'Toppings Perros', stock: 3000 },

  // Salchichas (compartidas con Salchipapas)
  { name: 'Mini Frankfurt', name_tag: 'TYPE_SAUSAGE', category: 'Salchichas', stock: 50 },
  { name: 'Catirota', name_tag: 'TYPE_SAUSAGE', category: 'Salchichas', stock: 50 },
  { name: 'CatireHot', name_tag: 'TYPE_SAUSAGE', category: 'Salchichas', stock: 30 },
  { name: 'Chicken', name_tag: 'TYPE_SAUSAGE', category: 'Salchichas', stock: 25 },
  { name: 'Chesse', name_tag: 'TYPE_SAUSAGE', category: 'Salchichas', stock: 15 },
  { name: 'Salchicatire', name_tag: 'TYPE_SAUSAGE', category: 'Salchichas', stock: 20 },
  { name: 'Chistorra', name_tag: 'TYPE_SAUSAGE', category: 'Salchichas', stock: 20 },
  { name: 'Uruguayo', name_tag: 'TYPE_SAUSAGE', category: 'Salchichas', stock: 15 },
  { name: 'Antioqueño', name_tag: 'TYPE_SAUSAGE', category: 'Salchichas', stock: 18 },
  { name: 'Choricatire', name_tag: 'TYPE_SAUSAGE', category: 'Salchichas', stock: 20 },
  { name: 'Chori Frito', name_tag: 'TYPE_SAUSAGE', category: 'Salchichas', stock: 22 },

  // Salsas
  { name: 'Ketchup', name_tag: 'SAUCE', category: 'Salsas', stock: 10 },
  { name: 'Mayonesa', name_tag: 'SAUCE', category: 'Salsas', stock: 8 },
  { name: 'Mostaza', name_tag: 'SAUCE', category: 'Salsas', stock: 6 },
  { name: 'Salsa de Ajo', name_tag: 'SAUCE', category: 'Salsas', stock: 6 },

  // ===== HAMBURGUESAS =====
  // Panes Hamburguesas
  { name: 'Pan Sencilla', name_tag: 'SIZE', category: 'Panes Hamburguesas', stock: 60 },
  { name: 'Pan Mixta', name_tag: 'SIZE', category: 'Panes Hamburguesas', stock: 60 },

  // Toppings Hamburguesas
  { name: 'Lechuga', name_tag: 'TOPPINGS', category: 'Toppings Hamburguesas', stock: 4000 },
  { name: 'Tomate', name_tag: 'TOPPINGS', category: 'Toppings Hamburguesas', stock: 5000 },
  { name: 'Cebolla Hamburguesa', name_tag: 'TOPPINGS', category: 'Toppings Hamburguesas', stock: 3000 },
  { name: 'Papas Hamburguesa', name_tag: 'TOPPINGS', category: 'Toppings Hamburguesas', stock: 6000 },
  { name: 'Queso gouda', name_tag: 'TOPPINGS', category: 'Toppings Hamburguesas', stock: 3000 },
  { name: 'Queso rallado', name_tag: 'TOPPINGS', category: 'Toppings Hamburguesas', stock: 2000 },
  { name: 'Tocineta', name_tag: 'TOPPINGS', category: 'Toppings Hamburguesas', stock: 5000 },
  { name: 'Huevo frito', name_tag: 'TOPPINGS', category: 'Toppings Hamburguesas', stock: 30 },

  // Carnes
  { name: 'Carne', name_tag: 'TYPE_MEAT', category: 'Carnes', stock: 25 },
  { name: 'Croqueta de Pollo', name_tag: 'TYPE_MEAT', category: 'Carnes', stock: 20 },
  { name: 'Croqueta de Chuleta', name_tag: 'TYPE_MEAT', category: 'Carnes', stock: 18 },

  // ===== SALCHIPAPAS =====
  // Papas
  { name: 'Junior-150g', name_tag: 'SIZE', category: 'Papas', stock: 8000 },
  { name: 'Normal-250g', name_tag: 'SIZE', category: 'Papas', stock: 8000 },

  // Toppings Salchipapas
  { name: 'Queso gouda Salchipapas', name_tag: 'TOPPINGS', category: 'Toppings Salchipapas', stock: 3000 },

  // ===== BEBIDAS =====
  { name: 'Coca Cola 2L', name_tag: 'SODA', category: 'Bebidas', stock: 20 },
  { name: 'Coca Cola 1L', name_tag: 'SODA', category: 'Bebidas', stock: 30 },
  { name: 'Coca Cola Personal', name_tag: 'SODA', category: 'Bebidas', stock: 40 },
  { name: 'Agua', name_tag: 'SODA', category: 'Bebidas', stock: 50 },
  { name: 'Nestea', name_tag: 'SODA', category: 'Bebidas', stock: 25 },
];

async function main() {
  console.log('=== RESEEDING INGREDIENTS ===');

  // Step 1: Delete ALL existing ingredients
  const deleted = await prisma.ingredient.deleteMany({});
  console.log(`Deleted ${deleted.count} existing ingredients`);

  // Step 2: Get all branches
  const branches = await prisma.branch.findMany({
    where: { deleted_at: null },
  });
  console.log(`Found ${branches.length} branches to seed`);

  // Step 3: Create ingredients for each branch
  let totalCreated = 0;
  for (const branch of branches) {
    console.log(`\nSeeding branch: ${branch.name} (ID: ${branch.id})`);

    for (const ingredient of ingredients) {
      await prisma.ingredient.create({
        data: {
          name: ingredient.name,
          name_tag: ingredient.name_tag,
          category: ingredient.category,
          stock: ingredient.stock,
          extra_price: 0,
          branch_id: branch.id,
        },
      });
      totalCreated++;
    }

    console.log(`  Created ${ingredients.length} ingredients`);
  }

  console.log(`\n=== SEED COMPLETED ===`);
  console.log(`Total ingredients created: ${totalCreated}`);
  console.log(`Ingredients per branch: ${ingredients.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
