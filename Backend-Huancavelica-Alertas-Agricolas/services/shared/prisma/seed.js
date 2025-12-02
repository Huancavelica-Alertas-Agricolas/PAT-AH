// Comentarios añadidos en español: script de seeds para la base de datos usando Prisma.
// Breve: conecta con `PrismaClient`, borra datos existentes y crea zonas, usuarios, alertas,
// notificaciones, datos climáticos y recomendaciones de ejemplo. Ejecutar con `node seed.js`.
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seeds...');

  // 1. Limpiar datos existentes
  console.log('🗑️  Limpiando datos existentes...');
  await prisma.verificationCode.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.weatherData.deleteMany({});
  await prisma.alert.deleteMany({});
  await prisma.zone.deleteMany({});
  await prisma.log.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.recommendation.deleteMany({});

  // 2. Crear Zonas de Huancavelica
  console.log('📍 Creando zonas...');
  const zones = await Promise.all([
    prisma.zone.create({
      data: {
        nombre: 'Huancavelica Centro',
        region: 'Huancavelica',
        poblacion: 25000,
        latitud: -12.7867,
        longitud: -74.9758,
      },
    }),
    prisma.zone.create({
      data: {
        nombre: 'Acobamba',
        region: 'Huancavelica',
        poblacion: 15000,
        latitud: -12.8433,
        longitud: -74.5700,
      },
    }),
    prisma.zone.create({
      data: {
        nombre: 'Tayacaja',
        region: 'Huancavelica',
        poblacion: 20000,
        latitud: -12.3000,
        longitud: -74.9500,
      },
    }),
    prisma.zone.create({
      data: {
        nombre: 'Churcampa',
        region: 'Huancavelica',
        poblacion: 12000,
        latitud: -12.7400,
        longitud: -74.3900,
      },
    }),
    prisma.zone.create({
      data: {
        nombre: 'Castrovirreyna',
        region: 'Huancavelica',
        poblacion: 8000,
        latitud: -13.2800,
        longitud: -75.3200,
      },
    }),
  ]);

  console.log(`✅ ${zones.length} zonas creadas`);

  // 3. Crear Usuarios
  console.log('👥 Creando usuarios...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = await Promise.all([
    // Administrador
    prisma.user.create({
      data: {
        nombre: 'Admin Sistema',
        email: 'admin@alertasegura.pe',
        telefono: '+51999000001',
        password: hashedPassword,
        ciudad: 'Huancavelica',
        zona: 'Huancavelica Centro',
        roles: '["administrador"]',
        activo: true,
      },
    }),
    // Autoridades
    prisma.user.create({
      data: {
        nombre: 'María González',
        email: 'maria.gonzalez@alertasegura.pe',
        telefono: '+51999000002',
        password: hashedPassword,
        ciudad: 'Huancavelica',
        zona: 'Acobamba',
        roles: '["autoridad"]',
        activo: true,
      },
    }),
    prisma.user.create({
      data: {
        nombre: 'Carlos Pérez',
        email: 'carlos.perez@alertasegura.pe',
        telefono: '+51999000003',
        password: hashedPassword,
        ciudad: 'Huancavelica',
        zona: 'Tayacaja',
        roles: '["autoridad"]',
        activo: true,
      },
    }),
    // Usuarios normales
    prisma.user.create({
      data: {
        nombre: 'Juan Mamani',
        email: 'juan.mamani@ejemplo.com',
        telefono: '+51999000004',
        password: hashedPassword,
        ciudad: 'Huancavelica',
        zona: 'Churcampa',
        roles: '["usuario"]',
        activo: true,
      },
    }),
    prisma.user.create({
      data: {
        nombre: 'Rosa Quispe',
        email: 'rosa.quispe@ejemplo.com',
        telefono: '+51999000005',
        password: hashedPassword,
        ciudad: 'Huancavelica',
        zona: 'Castrovirreyna',
        roles: '["usuario"]',
        activo: true,
      },
    }),
  ]);

  console.log(`✅ ${users.length} usuarios creados`);

  // 4. Crear Alertas
  console.log('⚠️  Creando alertas...');
  const alerts = await Promise.all([
    prisma.alert.create({
      data: {
        titulo: 'Alerta de Helada Nocturna',
        descripcion: 'Se esperan temperaturas bajo 0°C durante la madrugada. Proteger cultivos sensibles.',
        tipo: 'helada',
        severidad: 'alta',
        prioridad: 'alta',
        estado: 'activa',
        zona: 'Huancavelica Centro',
        ubicacion: 'Plaza de Armas',
        reportadoPor: users[1].nombre,
        userId: users[1].id,
      },
    }),
    prisma.alert.create({
      data: {
        titulo: 'Lluvia Intensa en Acobamba',
        descripcion: 'Precipitaciones superiores a 50mm. Riesgo de inundación en zonas bajas.',
        tipo: 'lluvia',
        severidad: 'alta',
        prioridad: 'alta',
        estado: 'en-proceso',
        zona: 'Acobamba',
        ubicacion: 'Zona agrícola norte',
        reportadoPor: users[2].nombre,
        userId: users[2].id,
        tiempoRespuesta: 45,
      },
    }),
    prisma.alert.create({
      data: {
        titulo: 'Vientos Fuertes en Tayacaja',
        descripcion: 'Velocidad del viento superior a 40 km/h. Asegurar estructuras.',
        tipo: 'viento',
        severidad: 'media',
        prioridad: 'media',
        estado: 'activa',
        zona: 'Tayacaja',
        ubicacion: 'Sector Este',
        reportadoPor: users[0].nombre,
        userId: users[0].id,
      },
    }),
    prisma.alert.create({
      data: {
        titulo: 'Riesgo de Sequía en Churcampa',
        descripcion: 'Temperatura elevada y baja humedad. Implementar riego.',
        tipo: 'sequia',
        severidad: 'media',
        prioridad: 'media',
        estado: 'activa',
        zona: 'Churcampa',
        ubicacion: 'Zona sur',
        reportadoPor: users[3].nombre,
        userId: users[3].id,
      },
    }),
    prisma.alert.create({
      data: {
        titulo: 'Granizada Severa',
        descripcion: 'Granizo de gran tamaño reportado. Daños en cultivos de papa.',
        tipo: 'granizada',
        severidad: 'alta',
        prioridad: 'alta',
        estado: 'resuelta',
        zona: 'Castrovirreyna',
        ubicacion: 'Valle central',
        reportadoPor: users[4].nombre,
        userId: users[4].id,
        tiempoRespuesta: 120,
        fecha: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 días atrás
      },
    }),
  ]);

  console.log(`✅ ${alerts.length} alertas creadas`);

  // Actualizar contador de alertas reportadas
  await prisma.user.update({
    where: { id: users[1].id },
    data: { alertasReportadas: 1 },
  });

  // Actualizar contador de alertas activas en zonas
  await prisma.zone.update({
    where: { nombre: 'Huancavelica Centro' },
    data: { alertasActivas: 1 },
  });
  await prisma.zone.update({
    where: { nombre: 'Acobamba' },
    data: { alertasActivas: 1 },
  });

  // 5. Crear Notificaciones
  console.log('🔔 Creando notificaciones...');
  const notificationPromises = [];
  
  for (const user of users) {
    notificationPromises.push(
      prisma.notification.create({
        data: {
          tipo: 'alerta',
          titulo: 'Nueva Alerta en tu Zona',
          mensaje: `Se ha emitido una nueva alerta para ${user.zona}`,
          prioridad: 'alta',
          userId: user.id,
        },
      }),
      prisma.notification.create({
        data: {
          tipo: 'sistema',
          titulo: 'Bienvenido a AlertaSegura',
          mensaje: 'Gracias por unirte al sistema de alertas agrícolas de Huancavelica',
          prioridad: 'baja',
          leido: true,
          userId: user.id,
        },
      }),
      prisma.notification.create({
        data: {
          tipo: 'clima',
          titulo: 'Actualización Climática',
          mensaje: 'Consulta las condiciones climáticas actualizadas para tu zona',
          prioridad: 'media',
          userId: user.id,
        },
      }),
      prisma.notification.create({
        data: {
          tipo: 'recomendacion',
          titulo: 'Recomendaciones para Heladas',
          mensaje: 'Revisa las recomendaciones para proteger tus cultivos de heladas',
          prioridad: 'alta',
          userId: user.id,
        },
      })
    );
  }

  const notifications = await Promise.all(notificationPromises);
  console.log(`✅ ${notifications.length} notificaciones creadas`);

  // 6. Crear datos climáticos históricos (últimos 7 días)
  console.log('🌤️  Creando datos climáticos...');
  const weatherPromises = [];
  
  for (let i = 0; i < 7; i++) {
    const fecha = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    
    for (const zone of zones) {
      weatherPromises.push(
        prisma.weatherData.create({
          data: {
            zona: zone.nombre,
            temperatura: 10 + Math.random() * 15,
            humedad: 50 + Math.random() * 30,
            precipitacion: Math.random() * 10,
            velocidadViento: 10 + Math.random() * 20,
            descripcion: 'Parcialmente nublado',
            fecha,
          },
        })
      );
    }
  }

  const weatherData = await Promise.all(weatherPromises);
  console.log(`✅ ${weatherData.length} registros climáticos creados`);

  // 7. Crear Recomendaciones
  console.log('💡 Creando recomendaciones...');
  const recommendations = [
    // Helada
    { tipoAlerta: 'helada', titulo: 'Proteger cultivos', descripcion: 'Cubrir plantas sensibles con mantas térmicas', prioridad: 'alta', orden: 1 },
    { tipoAlerta: 'helada', titulo: 'Riego preventivo', descripcion: 'Regar antes del atardecer', prioridad: 'alta', orden: 2 },
    { tipoAlerta: 'helada', titulo: 'Cosecha anticipada', descripcion: 'Cosechar productos maduros', prioridad: 'media', orden: 3 },
    
    // Granizada
    { tipoAlerta: 'granizada', titulo: 'Mallas antigranizo', descripcion: 'Instalar sistemas de protección', prioridad: 'alta', orden: 1 },
    { tipoAlerta: 'granizada', titulo: 'Refugio de animales', descripcion: 'Proteger ganado en establos', prioridad: 'alta', orden: 2 },
    
    // Lluvia
    { tipoAlerta: 'lluvia', titulo: 'Drenaje', descripcion: 'Verificar sistemas de drenaje', prioridad: 'alta', orden: 1 },
    { tipoAlerta: 'lluvia', titulo: 'Control de erosión', descripcion: 'Implementar barreras en pendientes', prioridad: 'alta', orden: 2 },
    
    // Sequía
    { tipoAlerta: 'sequia', titulo: 'Riego eficiente', descripcion: 'Implementar riego por goteo', prioridad: 'alta', orden: 1 },
    { tipoAlerta: 'sequia', titulo: 'Conservación de agua', descripcion: 'Almacenar agua de lluvia', prioridad: 'alta', orden: 2 },
    
    // Viento
    { tipoAlerta: 'viento', titulo: 'Reforzar estructuras', descripcion: 'Asegurar invernaderos', prioridad: 'alta', orden: 1 },
    { tipoAlerta: 'viento', titulo: 'Tutorado de plantas', descripcion: 'Atar plantas altas', prioridad: 'media', orden: 2 },
  ];

  await Promise.all(recommendations.map(rec => prisma.recommendation.create({ data: rec })));
  console.log(`✅ ${recommendations.length} recomendaciones creadas`);

  console.log('');
  console.log('✨ Seeds completados exitosamente!');
  console.log('');
  console.log('📊 Resumen:');
  console.log(`   - ${zones.length} zonas`);
  console.log(`   - ${users.length} usuarios`);
  console.log(`   - ${alerts.length} alertas`);
  console.log(`   - ${notifications.length} notificaciones`);
  console.log(`   - ${weatherData.length} datos climáticos`);
  console.log(`   - ${recommendations.length} recomendaciones`);
  console.log('');
  console.log('🔑 Credenciales de prueba:');
  console.log('   Admin: +51999000001 / password123');
  console.log('   Autoridad 1: +51999000002 / password123');
  console.log('   Autoridad 2: +51999000003 / password123');
  console.log('   Usuario 1: +51999000004 / password123');
  console.log('   Usuario 2: +51999000005 / password123');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error en seeds:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
