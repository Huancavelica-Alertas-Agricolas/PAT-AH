const { Module } = require('@nestjs/common');
const { PrometheusModule } = require('@willsoto/nestjs-prometheus');
const { ClientsModule, Transport } = require('@nestjs/microservices');
const { ConfigModule } = require('@nestjs/config');
const { TypeOrmModule } = require('@nestjs/typeorm');
const { AlertController } = require('./alert.controller');
const { AlertService } = require('./alert.service');
const { Alert } = require('./entities/alert.entity');
const { UserAlert } = require('./entities/user-alert.entity');

const moduleConfig = {
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || 'admin',
      password: process.env.DB_PASSWORD || 'admin',
      database: process.env.DB_NAME || 'alert_service',
      entities: [Alert, UserAlert],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
    }),
    TypeOrmModule.forFeature([Alert, UserAlert]),
    ClientsModule.register([
      {
        name: 'WEATHER_SERVICE',
        transport: Transport.TCP,
        options: { 
          host: process.env.WEATHER_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.WEATHER_SERVICE_PORT) || 3002 
        },
      },
      {
        name: 'NOTIFICATION_SERVICE',
        transport: Transport.TCP,
        options: { 
          host: process.env.NOTIFICATION_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.NOTIFICATION_SERVICE_PORT) || 3003 
        },
      },
      {
        name: 'USER_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.USER_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.USER_SERVICE_PORT) || 3001,
        },
      },
    ]),
    PrometheusModule.register(),
  ],
  controllers: [AlertController],
  providers: [AlertService],
};

class AppModule {}

module.exports = { AppModule };