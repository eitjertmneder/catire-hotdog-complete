import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Recetas: conecta productos del menú con ingredientes
// Formato: { product_name, ingredient_name, quantity_needed }

const RECIPES = [
  // ===== PERRO CALIENTE =====
  // Pan Normal + 1 salchicha + toppings + salsas
  { product_name: 'Perro Normal', ingredient_name: 'Pan Normal', quantity_needed: 1 },
  // Las salchichas se descuentan según la selección del cliente (1 unidad)
  // Los toppings se descuentan según selección
  // Las salsas se descuentan según selección

  // Pan Mini + 1 salchicha mini
  { product_name: 'Perro Mini', ingredient_name: 'Pan Mini', quantity_needed: 1 },

  // ===== SALCHIPAPA =====
  // Junior: 150g papa + 1 Chesse
  { product_name: 'Salchipapa Junior', ingredient_name: 'Normal-250g', quantity_needed: 150, notes: 'En gramos' },
  { product_name: 'Salchipapa Junior', ingredient_name: 'Chesse', quantity_needed: 1 },

  // Normal: 250g papa + Salchicatire (fija) + 1 más
  { product_name: 'Salchipapa Normal', ingredient_name: 'Normal-250g', quantity_needed: 250, notes: 'En gramos' },
  { product_name: 'Salchipapa Normal', ingredient_name: 'Salchicatire', quantity_needed: 1 },

  // ===== HAMBURGUESA =====
  // Sencilla: 1 pan + 1 carne + toppings
  { product_name: 'Hamburguesa Sencilla', ingredient_name: 'Pan Sencilla', quantity_needed: 1 },
  { product_name: 'Hamburguesa Sencilla', ingredient_name: 'Carne', quantity_needed: 1 },

  // Mixta: 1 pan + 2 carnes + toppings
  { product_name: 'Hamburguesa Mixta', ingredient_name: 'Pan Mixta', quantity_needed: 1 },
  // Las carnes se descuentan según selección (1 o 2)

  // ===== BEBIDAS =====
  { product_name: 'Coca Cola 2L', ingredient_name: 'Coca Cola 2L', quantity_needed: 1 },
  { product_name: 'Coca Cola 1L', ingredient_name: 'Coca Cola 1L', quantity_needed: 1 },
  { product_name: 'Coca Cola Personal', ingredient_name: 'Coca Cola Personal', quantity_needed: 1 },
  { product_name: 'Agua', ingredient_name: 'Agua', quantity_needed: 1 },
  { product_name: 'Nestea', ingredient_name: 'Nestea', quantity_needed: 1 },
];

async function main() {
  console.log('=== SEEDING RECIPES ===');

  // Limpiar recetas existentes
  await prisma.$executeRaw`DELETE FROM recipes`;
  console.log('Recetas anteriores eliminadas');

  let created = 0;
  let skipped = 0;

  for (const recipe of RECIPES) {
    // Buscar el ingrediente por nombre
    const ingredient = await prisma.ingredient.findFirst({
      where: { name: recipe.ingredient_name, deleted_at: null },
    });

    if (!ingredient) {
      console.log(`  ⚠️ Ingrediente no encontrado: ${recipe.ingredient_name}`);
      skipped++;
      continue;
    }

    await prisma.$executeRaw`
      INSERT INTO recipes (product_name, ingredient_id, quantity_needed, notes, created_at, updated_at)
      VALUES (${recipe.product_name}, ${ingredient.id}, ${recipe.quantity_needed}, ${recipe.notes || null}, NOW(), NOW())
    `;
    created++;
  }

  console.log(`\n=== RECIPES SEEDED ===`);
  console.log(`Creadas: ${created}`);
  console.log(`Omitidas: ${skipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
