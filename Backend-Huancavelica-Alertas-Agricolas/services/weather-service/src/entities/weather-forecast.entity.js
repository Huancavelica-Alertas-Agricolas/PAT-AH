const { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } = require('typeorm');

class WeatherForecast {
  constructor() {
    this.forecast_id = undefined; // string
    this.location = {
      name: '',
      latitude: 0,
      longitude: 0,
      coordinates: [0, 0]
    };
    this.forecast_time = new Date();
    this.temperature_celsius = null; // number
    this.humidity_percentage = null; // number
    this.precipitation_prob = null; // number
    this.wind_speed_kmh = null; // number
    this.wind_direction = null; // string
    this.created_at = new Date();
  }
}

// Applying decorators as metadata for TypeORM
Entity('weather_forecasts')(WeatherForecast);
PrimaryGeneratedColumn('uuid')(WeatherForecast.prototype, 'forecast_id');
Column('jsonb')(WeatherForecast.prototype, 'location');
Column({ type: 'timestamp with time zone' })(WeatherForecast.prototype, 'forecast_time');
Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })(WeatherForecast.prototype, 'temperature_celsius');
Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })(WeatherForecast.prototype, 'humidity_percentage');
Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })(WeatherForecast.prototype, 'precipitation_prob');
Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })(WeatherForecast.prototype, 'wind_speed_kmh');
Column({ type: 'varchar', length: 50, nullable: true })(WeatherForecast.prototype, 'wind_direction');
CreateDateColumn({ type: 'timestamp with time zone' })(WeatherForecast.prototype, 'created_at');

module.exports = { WeatherForecast };