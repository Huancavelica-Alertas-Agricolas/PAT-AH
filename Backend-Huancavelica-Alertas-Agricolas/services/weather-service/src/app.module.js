const { Module } = require('@nestjs/common');
const { PrometheusModule } = require('@willsoto/nestjs-prometheus');
const { ConfigModule } = require('@nestjs/config');
const { HttpModule } = require('@nestjs/axios');
const { ClientsModule, Transport } = require('@nestjs/microservices');
const { TypeOrmModule } = require('@nestjs/typeorm');
const { WeatherController } = require('./weather.controller');
const { WeatherService } = require('./weather.service');
const { RiesgoClimaService } = require('./riesgo-clima.service');
const { WeatherForecast } = require('./entities/weather-forecast.entity');
const { WeatherHistory } = require('./entities/weather-history.entity');

const moduleConfig = {
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || 'admin',
      password: process.env.DB_PASSWORD || 'admin',
      database: process.env.DB_NAME || 'agro_dev',
      entities: [WeatherForecast, WeatherHistory],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
    }),
    TypeOrmModule.forFeature([WeatherForecast, WeatherHistory]),
    HttpModule,
    ClientsModule.register([
      {
        name: 'ALERT_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.ALERT_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.ALERT_SERVICE_PORT) || 3004,
        },
      },
    ]),
    PrometheusModule.register(),
  ],
  controllers: [WeatherController],
  providers: [WeatherService, RiesgoClimaService],
};

class AppModule {}

module.exports = { AppModule };