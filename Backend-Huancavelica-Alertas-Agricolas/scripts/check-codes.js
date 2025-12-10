const { PrismaClient } = require('@prisma/client');

async function checkVerificationCodes() {
  const prisma = new PrismaClient();

  try {
    const codes = await prisma.verificationCode.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });

    console.log('📋 Códigos de verificación en la base de datos:');
    console.log('='.repeat(80));

    if (codes.length === 0) {
      console.log('No hay códigos de verificación.');
      return;
    }

    codes.forEach((code, index) => {
      console.log(`${index + 1}. Usuario: ${code.user.nombre}`);
      console.log(`   Teléfono: ${code.user.telefono}`);
      console.log(`   Código: ${code.codigo}`);
      console.log(`   Tipo: ${code.tipo}`);
      console.log(`   Expiración: ${code.expiraEn}`);
      console.log(`   Usado: ${code.usado}`);
      console.log(`   Creado: ${code.createdAt}`);
      console.log('-'.repeat(40));
    });

  } catch (error) {
    console.error('Error al consultar códigos de verificación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVerificationCodes();