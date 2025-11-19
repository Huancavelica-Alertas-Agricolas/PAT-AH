const { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } = require('typeorm');

class WeatherHistory {
  constructor() {
    this.history_id = undefined; // string
    this.location = {
      name: '',
      latitude: 0,
      longitude: 0,
      coordinates: [0, 0]
    };
    this.recorded_time = new Date();
    this.temperature_celsius = null; // number
    this.humidity_percentage = null; // number
    this.precipitation_mm = null; // number
    this.wind_speed_kmh = null; // number
    this.created_at = new Date();
  }
}

// Applying decorators as metadata for TypeORM
Entity('weather_history')(WeatherHistory);
PrimaryGeneratedColumn('uuid')(WeatherHistory.prototype, 'history_id');
Column('jsonb')(WeatherHistory.prototype, 'location');
Column({ type: 'timestamp with time zone' })(WeatherHistory.prototype, 'recorded_time');
Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })(WeatherHistory.prototype, 'temperature_celsius');
Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })(WeatherHistory.prototype, 'humidity_percentage');
Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })(WeatherHistory.prototype, 'precipitation_mm');
Column({ type: 'numeric', precision: 5, scale: 2, nullable: true })(WeatherHistory.prototype, 'wind_speed_kmh');
CreateDateColumn({ type: 'timestamp with time zone' })(WeatherHistory.prototype, 'created_at');

module.exports = { WeatherHistory };