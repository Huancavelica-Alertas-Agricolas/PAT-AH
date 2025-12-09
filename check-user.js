const { PrismaClient } = require('@prisma/client');

async function checkUser() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 Verificando usuario +51904031408...');

    const user = await prisma.user.findUnique({
      where: { telefono: '+51904031408' },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        password: true,
        preferredChannel: true
      }
    });

    if (!user) {
      console.log('❌ Usuario no encontrado en la base de datos');
      return;
    }

    console.log('✅ Usuario encontrado:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Nombre: ${user.nombre}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Teléfono: ${user.telefono}`);
    console.log(`   Preferred Channel: ${user.preferredChannel}`);
    console.log(`   Password hash exists: ${!!user.password}`);
    console.log(`   Password hash length: ${user.password ? user.password.length : 0}`);

    // Probar la contraseña proporcionada
    const bcrypt = require('bcryptjs');
    const testPassword = '83852255703052900751';
    const isValid = await bcrypt.compare(testPassword, user.password || '');

    console.log(`\n🔐 Verificación de contraseña:`);
    console.log(`   Contraseña de prueba: ${testPassword}`);
    console.log(`   ¿Es válida?: ${isValid ? '✅ SÍ' : '❌ NO'}`);

    if (!isValid) {
      console.log('\n💡 Posibles soluciones:');
      console.log('   1. Verifica que la contraseña sea exactamente: 83852255703052900751');
      console.log('   2. El usuario podría haberse registrado con una contraseña diferente');
      console.log('   3. Podría haber un problema con el hash de la contraseña');
    }

  } catch (error) {
    console.error('❌ Error al verificar usuario:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();