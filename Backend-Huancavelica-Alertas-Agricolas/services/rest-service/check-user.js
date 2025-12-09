const { PrismaClient } = require('@prisma/client');

async function checkUser() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 Verificando usuario por email: aldair456.12358@gmail.com...');

    const user = await prisma.user.findUnique({
      where: { email: 'aldair456.12358@gmail.com' },
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
    console.log(`   Password hash: ${user.password}`);

    // Probar diferentes formatos de teléfono
    const phoneFormats = [
      '+51904031408',  // con +51
      '904031408',     // sin +51
      '51904031408'    // sin +
    ];

    console.log('\n📱 Probando diferentes formatos de teléfono:');
    for (const phone of phoneFormats) {
      const userByPhone = await prisma.user.findUnique({
        where: { telefono: phone },
        select: { id: true, nombre: true }
      });
      console.log(`   ${phone}: ${userByPhone ? '✅ Existe' : '❌ No existe'}`);
    }

    // Probar la contraseña proporcionada
    const bcrypt = require('bcryptjs');
    const testPassword = '83852255703052900751';
    const isValid = await bcrypt.compare(testPassword, user.password || '');

    console.log(`\n🔐 Verificación de contraseña:`);
    console.log(`   Contraseña de prueba: ${testPassword}`);
    console.log(`   ¿Es válida?: ${isValid ? '✅ SÍ' : '❌ NO'}`);

    if (!isValid) {
      console.log('\n💡 Posibles soluciones:');
      console.log('   1. La contraseña registrada es diferente');
      console.log('   2. Podría haber un problema con el hash');
      console.log('   3. Intenta hacer reset de contraseña');
    } else {
      console.log('\n✅ La contraseña es correcta. El problema debe ser el teléfono.');
      console.log('   Intenta con el teléfono exacto: ' + user.telefono);
    }

  } catch (error) {
    console.error('❌ Error al verificar usuario:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();