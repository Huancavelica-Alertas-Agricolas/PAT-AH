import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    
    // Configurar CORS para permitir requests desde el frontend
    app.enableCors({
      origin: ['http://localhost:3000', 'http://localhost:5173'],
      credentials: true,
    });

    // Puerto por defecto
    const port = process.env.PORT || 3001;
    
    console.log('🤖 Iniciando microservicio de IA...');
    console.log('📊 Servicios disponibles:');
    console.log('   - Procesamiento de Excel');
    console.log('   - Machine Learning (Regresión)');
    console.log('   - API del Clima');
    
    await app.listen(port);
    
    console.log(`\n🚀 Microservicio de IA ejecutándose en http://localhost:${port}`);
    console.log('🏥 Health check: http://localhost:' + port + '/ai/health');
    console.log('📚 Documentación: AI_MICROSERVICE_README.md');
    console.log('🧪 Prueba con: node test-ai.js\n');
    
  } catch (error) {
    console.error('❌ Error iniciando el microservicio:', error.message);
    process.exit(1);
  }
}

bootstrap();
