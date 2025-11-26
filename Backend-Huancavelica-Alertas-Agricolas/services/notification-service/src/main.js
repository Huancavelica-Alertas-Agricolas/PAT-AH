const { ValidationPipe } = require('@nestjs/common');
const { AllExceptionsFilter } = require('./all-exceptions.filter');
const { NestFactory } = require('@nestjs/core');
const { Transport } = require('@nestjs/microservices');
const { AppModule } = require('./app.module');
const logger = require('./logger');

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: parseInt(process.env.PORT) || 3003,
    },
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.useGlobalFilters(new AllExceptionsFilter(logger));
  await app.listen();
  logger.info('📧 Notification Service is listening on port 3003');
}

bootstrap();