import { PrismaService } from '../src/prisma/prisma.service';

const prisma = new PrismaService();

async function main() {
  const order = await prisma.order.create({
    data: {
      user_id: 3,
      is_delivery: true,
      notes: 'Orden especial',
      address: {
        street: 5,
        avenue: 10,
        house_number: 2,
        reference: 'Al lado de Pizza Antonio',
      },
      status: 'PENDING',
      items: {
        create: [
          {
            product_id: 1,
            quantity: 2,
            base_price: 4.5,
            features: [
              {
                name_tag: 'TYPE_SAUSAGE',
                value: 'Catirota',
              },
              {
                name_tag: 'TOPPINGS',
                value: 'Queso,Papa,Zanahoria',
              },
              {
                name_tag: 'SIZE',
                value: 'Normal',
              },
              {
                name_tag: 'SAUCE',
                value: 'Ketchup',
              },
            ],
          },
          {
            product_id: 2,
            quantity: 1,
            base_price: 5,
            features: [
              {
                name_tag: 'TYPE_MEAT',
                value: 'Croqueta de pollo,Carne',
              },
              {
                name_tag: 'SIZE',
                value: 'Mixta',
              },
              {
                name_tag: 'TOPPINGS',
                value:
                  'Lechuga,Tomate,Cebolla,Papas,Queso_tipo_gouda,Queso_rallado,Huevo_frito',
              },
            ],
          },
        ],
      },
    },
  });

  console.log('Order seed created', order.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
