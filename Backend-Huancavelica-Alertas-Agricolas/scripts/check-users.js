const { PrismaClient } = require('@prisma/client');

async function checkUsers() {
  const prisma = new PrismaClient();

  try {
    const users = await prisma.user.findMany();

    console.log('👥 Usuarios en la base de datos:');
    console.log('='.repeat(60));

    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Nombre: ${user.nombre}`);
      console.log(`   Email: ${user.email || 'N/A'}`);
      console.log(`   Teléfono: ${user.telefono || 'N/A'}`);
      console.log(`   Activo: ${user.activo}`);
      console.log('-'.repeat(30));
    });

  } catch (error) {
    console.error('Error al consultar usuarios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();