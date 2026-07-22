import * as bcrypt from 'bcrypt';
import { DefaultPermissions, Role } from './types';
import { PrismaService } from '../src/prisma/prisma.service';

const prisma = new PrismaService();

async function main() {
  const roleNames: Role[] = ['client', 'employee', 'admin'];

  for (const name of roleNames) {
    const defaultPermissions: DefaultPermissions = {
      client: {
        Branches: ['read'],
        Products: ['read'],
        Menus: ['read'],
        Orders: ['create', 'read'],
        Purchases: ['create', 'read'],
        Users: ['update'],
        Roles: [],
        Ingredients: ['read'],
      },
      employee: {
        Menus: ['create', 'read', 'update', 'delete'],
        Products: ['create', 'read', 'update', 'delete'],
        Orders: ['read', 'update'],
        Purchases: ['read'],
        Branches: ['read'],
        Users: ['read'],
        Roles: [],
        Ingredients: ['read'],
      },
      admin: {
        Branches: ['create', 'read', 'update', 'delete'],
        Menus: ['create', 'read', 'update', 'delete'],
        Products: ['create', 'read', 'update', 'delete'],
        Users: ['create', 'read', 'update', 'delete'],
        Roles: ['create', 'read', 'update', 'delete'],
        Orders: ['create', 'read', 'update', 'delete'],
        Purchases: ['create', 'read', 'update', 'delete'],
        Ingredients: ['create', 'read', 'update', 'delete'],
      },
    };

    await prisma.role.upsert({
      where: { name },
      update: {},
      create: {
        name,
        permissions_json: defaultPermissions[name],
      },
    });
  }

  const clientRole = await prisma.role.findUnique({
    where: { name: 'client' },
  });
  const employeeRole = await prisma.role.findUnique({
    where: { name: 'employee' },
  });
  const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });

  const pwd = await bcrypt.hash('12345678', 10);

  if (clientRole) {
    await prisma.user.upsert({
      where: { email: 'carlos@gmail.com' },
      update: {},
      create: {
        role_id: clientRole.id,
        full_name: 'Carlos Mendoza',
        email: 'carlos@gmail.com',
        dni: 25918307,
        phone_1: '04123028710',
        password: pwd,
      },
    });
  }

  if (employeeRole) {
    await prisma.user.upsert({
      where: { email: 'sergio@gmail.com' },
      update: {},
      create: {
        role_id: employeeRole.id,
        full_name: 'Sergio Guerrero',
        email: 'sergio@gmail.com',
        dni: 30827401,
        phone_1: '042630963881',
        password: pwd,
      },
    });
  }

  if (adminRole) {
    await prisma.user.upsert({
      where: { email: 'wilmer@hotmail.com' },
      update: {},
      create: {
        role_id: adminRole.id,
        full_name: 'Wilmer Perez',
        email: 'wilmer@hotmail.com',
        dni: 14029873,
        phone_1: '04225025023',
        password: pwd,
      },
    });
  }

  console.log('Seed de autenticación completado');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
