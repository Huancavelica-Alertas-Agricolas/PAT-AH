const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Crear usuario de prueba
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user = await prisma.user.upsert({
      where: { telefono: '+51999999999' },
      update: {},
      create: {
        telefono: '+51999999999',
        password: hashedPassword,
        nombre: 'Usuario Prueba',
        email: 'test@example.com',
        preferredChannel: 'email',
        alertasReportadas: 0,
        activo: true,
        roles: '["usuario"]'
      }
    });

    console.log('Usuario de prueba creado:', user);
  } catch (error) {
    console.error('Error creando usuario:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();