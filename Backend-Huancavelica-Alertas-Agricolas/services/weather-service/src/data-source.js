import { DataSource } from 'typeorm';
import { WeatherForecast } from './entities/weather-forecast.entity';
import { WeatherHistory } from './entities/weather-history.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'admin',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'agro_dev',
  entities: [WeatherForecast, WeatherHistory],
  synchronize: process.env.NODE_ENV === 'development', // Solo en desarrollo
  logging: process.env.NODE_ENV === 'development',
});