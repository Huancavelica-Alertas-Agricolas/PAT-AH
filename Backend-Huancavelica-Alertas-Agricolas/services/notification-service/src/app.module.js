// Comentarios añadidos en español: indica que se añadieron comentarios sin cambios lógicos.
const { Module } = require('@nestjs/common');
const { GraphQLModule } = require('@nestjs/graphql');
const { ApolloDriver } = require('@nestjs/apollo');
const { PrometheusModule } = require('@willsoto/nestjs-prometheus');
const { ConfigModule } = require('@nestjs/config');
const { MailModule } = require('./mail/mail.module');
const { NotificationController } = require('./notification.controller');
const { NotificationService } = require('./notification.service');

// Configuración del módulo principal del servicio de notificaciones.
// `imports` incluye GraphQL opcional, configuración global, módulo de mail y métricas.
const moduleConfig = {
  imports: [
    ...(process.env.ENABLE_GRAPHQL === '1' ? [GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: true,
      path: '/graphql',
      playground: true,
      introspection: true,
      sortSchema: true,
    })] : []),
    ConfigModule.forRoot({ isGlobal: true }),
    MailModule,
    PrometheusModule.register(),
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
};

class AppModule {}

module.exports = { AppModule };