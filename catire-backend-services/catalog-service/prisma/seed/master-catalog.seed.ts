import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Catálogo maestro de ingredientes
const MASTER_CATALOG = [
  // ===== PANES =====
  { name: 'Pan Normal', category: 'Panes', unit: 'unidades', stock: 80, extra_price: 0, name_tag: 'SIZE', feature_value: 'Normal' },
  { name: 'Pan Mini', category: 'Panes', unit: 'unidades', stock: 50, extra_price: 0, name_tag: 'SIZE', feature_value: 'Mini' },
  { name: 'Pan de Hamburguesa', category: 'Panes', unit: 'unidades', stock: 60, extra_price: 0, name_tag: 'SIZE', feature_value: 'Hamburguesa' },

  // ===== SALCHICHAS =====
  { name: 'Salchicha Normal', category: 'Salchichas', unit: 'unidades', stock: 100, extra_price: 0, name_tag: 'TYPE_SAUSAGE', feature_value: 'Normal' },
  { name: 'Salchicha Especial', category: 'Salchichas', unit: 'unidades', stock: 50, extra_price: 0, name_tag: 'TYPE_SAUSAGE', feature_value: 'Especial' },

  // ===== CARNES =====
  { name: 'Carne de Res', category: 'Carnes', unit: 'unidades', stock: 60, extra_price: 0, name_tag: 'TYPE_MEAT', feature_value: 'Res' },
  { name: 'Pechuga de Pollo', category: 'Carnes', unit: 'unidades', stock: 40, extra_price: 0, name_tag: 'TYPE_MEAT', feature_value: 'Pollo' },
  { name: 'Chuleta de Cerdo', category: 'Carnes', unit: 'unidades', stock: 30, extra_price: 0, name_tag: 'TYPE_MEAT', feature_value: 'Chuleta' },

  // ===== PAPAS =====
  { name: 'Papa Frita', category: 'Papas', unit: 'gramos', stock: 50000, extra_price: 0, name_tag: 'SIZE', feature_value: 'Papa' },

  // ===== TOPPINGS =====
  { name: 'Queso Rallado', category: 'Toppings', unit: 'gramos', stock: 5000, extra_price: 0.50, name_tag: 'TOPPINGS', feature_value: 'Queso' },
  { name: 'Papas Rayadas', category: 'Toppings', unit: 'gramos', stock: 3000, extra_price: 0.50, name_tag: 'TOPPINGS', feature_value: 'Papas' },
  { name: 'Tocineta', category: 'Toppings', unit: 'gramos', stock: 2000, extra_price: 1.00, name_tag: 'TOPPINGS', feature_value: 'Tocineta' },
  { name: 'Maíz Tierno', category: 'Toppings', unit: 'gramos', stock: 3000, extra_price: 0.50, name_tag: 'TOPPINGS', feature_value: 'Maíz' },

  // ===== SALSAS =====
  { name: 'Ketchup', category: 'Salsas', unit: 'litros', stock: 10, extra_price: 0, name_tag: 'SAUCE', feature_value: 'Ketchup' },
  { name: 'Mostaza', category: 'Salsas', unit: 'litros', stock: 8, extra_price: 0, name_tag: 'SAUCE', feature_value: 'Mostaza' },
  { name: 'Mayonesa', category: 'Salsas', unit: 'litros', stock: 8, extra_price: 0, name_tag: 'SAUCE', feature_value: 'Mayonesa' },
  { name: 'Salsa de Ajo', category: 'Salsas', unit: 'litros', stock: 6, extra_price: 0, name_tag: 'SAUCE', feature_value: 'Ajo' },

  // ===== BEBIDAS =====
  { name: 'Coca Cola Lata', category: 'Bebidas', unit: 'unidades', stock: 100, extra_price: 0, name_tag: 'SODA', feature_value: 'Coca Cola' },
  { name: 'Coca Cola 1.5L', category: 'Bebidas', unit: 'unidades', stock: 50, extra_price: 0, name_tag: 'SODA', feature_value: 'Coca Cola 1.5L' },
  { name: 'Hit Lata', category: 'Bebidas', unit: 'unidades', stock: 60, extra_price: 0, name_tag: 'SODA', feature_value: 'Hit' },
  { name: 'Té Frío', category: 'Bebidas', unit: 'unidades', stock: 40, extra_price: 0, name_tag: 'SODA', feature_value: 'Té Frío' },
  { name: 'Agua Mineral', category: 'Bebidas', unit: 'unidades', stock: 80, extra_price: 0, name_tag: 'SODA', feature_value: 'Agua' },
];

// IDs de las sucursales activas
const BRANCH_IDS = [1, 3, 4, 5, 7, 8, 9, 10, 11];

async function main() {
  console.log('=== SEEDING MASTER CATALOG ===');

  // 1. Limpiar ingredientes existentes
  await prisma.$executeRaw`DELETE FROM ingredients`;
  await prisma.$executeRaw`DELETE FROM ingredient_availability`;
  console.log('Ingredientes anteriores eliminados');

  // 2. Crear ingredientes del catálogo maestro (solo para branch_id = NULL, catálogo global)
  let created = 0;
  for (const item of MASTER_CATALOG) {
    await prisma.$executeRaw`
      INSERT INTO ingredients (name, name_tag, category, stock, branch_id, feature_tag, feature_value, extra_price, unit, created_at, updated_at)
      VALUES (${item.name}, ${item.name_tag}, ${item.category}, ${item.stock}, NULL, ${item.name_tag}, ${item.feature_value}, ${item.extra_price}, ${item.unit}, NOW(), NOW())
    `;
    created++;
  }
  console.log(`Creados ${created} ingredientes en catálogo maestro`);

  // 3. Obtener IDs de los ingredientes creados
  const ingredients = await prisma.$queryRaw`SELECT id, name FROM ingredients WHERE branch_id IS NULL` as any[];

  // 4. Crear disponibilidad para cada sucursal
  let availabilityCreated = 0;
  for (const branchId of BRANCH_IDS) {
    for (const ingredient of ingredients) {
      await prisma.$executeRaw`
        INSERT INTO ingredient_availability (ingredient_id, branch_id, available, created_at, updated_at)
        VALUES (${ingredient.id}, ${branchId}, true, NOW(), NOW())
      `;
      availabilityCreated++;
    }
  }
  console.log(`Creadas ${availabilityCreated} entradas de disponibilidad`);

  console.log('\n=== MASTER CATALOG SEEDED ===');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
