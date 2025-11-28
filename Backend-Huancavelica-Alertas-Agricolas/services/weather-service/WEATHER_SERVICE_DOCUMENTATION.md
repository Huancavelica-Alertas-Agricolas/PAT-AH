# Weather Service Documentation

## Overview
The Weather Service is a specialized microservice that handles meteorological data processing, climate risk analysis, and weather forecasting for the Agricultural Alert System in Huancavelica. It integrates with SENAMHI (Peru's National Meteorology and Hydrology Service) and provides weather-based insights for agricultural decision making.

## Architecture & Technology Stack

### Core Technologies
- **Framework**: NestJS (v11.1.6) with microservices architecture
- **Language**: JavaScript (ES6+) with CommonJS modules
- **Database**: PostgreSQL with TypeORM for weather data storage
- **HTTP Client**: Axios for external API communication
- **Data Processing**: RxJS for reactive programming
- **File Processing**: Custom CSV/Excel readers for SENAMHI data

### External Integrations
- **SENAMHI API**: Real-time weather data and forecasts
- **OpenWeatherMap**: Additional weather data sources
- **CSV Data Processing**: Historical weather data ingestion

## File Structure & Components

### Core Service Files

#### `src/main.js`
- **Purpose**: Bootstrap microservice with TCP transport
- **Configuration**:
  - TCP listener on port 3002
  - Global validation pipes and exception filters
  - Logger integration for weather service operations

#### `src/app.module.js`
- **Purpose**: Main module configuration and dependency injection
- **Key Configurations**:
  - PostgreSQL database connection for weather data
  - HTTP module for external API calls
  - TypeORM entity registration (WeatherForecast, WeatherHistory)
  - Client connections to Alert Service
  - Prometheus monitoring setup

#### `src/weather.controller.js`
- **Purpose**: Microservice message pattern handlers
- **Message Patterns**:
  - `get_climate_alerts`: Climate alert generation
  - `generate_weather_report`: Weather report creation
  - `get_weather_data`: Current weather data retrieval
  - `save_historical_data`: SENAMHI data persistence

#### `src/weather.service.js`
- **Purpose**: Core weather data processing and API integration
- **Key Methods**:
  - `getCurrentWeatherData()`: Real-time weather data fetching
  - `generateAndSaveWeatherReport()`: Weather report generation with database storage
  - `saveHistoricalDataFromSenamhi()`: SENAMHI data processing and storage
  - `processWeatherData(data)`: Weather data analysis and risk assessment
  - `calculateRisks(weatherData)`: Agricultural risk calculation (frost, drought, etc.)

### Climate Analysis Components

#### `src/riesgo-clima.service.js`
- **Purpose**: Advanced climate risk analysis and alert generation
- **Key Features**:
  - **Frost Risk Analysis**: Temperature-based frost probability calculation
  - **Drought Assessment**: Precipitation and soil moisture analysis
  - **Crop Impact Modeling**: Crop-specific weather impact assessment
  - **Regional Risk Mapping**: Geographic risk distribution analysis

**Key Methods**:
```javascript
async generarAlertas() {
    // Generate comprehensive climate alerts
    const alertas = [];
    const datosClimaticos = await this.obtenerDatosClimaticos();
    
    // Frost risk evaluation
    if (datosClimaticos.temperatura_minima < 2) {
        alertas.push(this.crearAlertaHelada(datosClimaticos));
    }
    
    // Drought risk evaluation  
    if (datosClimaticos.precipitacion < 10) {
        alertas.push(this.crearAlertaSequia(datosClimaticos));
    }
    
    return alertas;
}
```

#### `src/senamhi-reader.js`
- **Purpose**: SENAMHI data file processing and parsing
- **Supported Formats**: CSV, Excel files with weather station data
- **Data Processing**:
  - Temperature records (min/max)
  - Precipitation measurements  
  - Humidity levels
  - Wind speed and direction
  - Extreme weather events

**Data Structure**:
```javascript
/**
 * @typedef {Object} SenamhiRecord
 * @property {string} fecha - Date of record
 * @property {number} temp_min - Minimum temperature (°C)
 * @property {number} temp_max - Maximum temperature (°C)
 * @property {number} precipitacion - Precipitation (mm)
 * @property {number} humedad - Humidity (%)
 * @property {number} viento - Wind speed (km/h)
 * @property {string} evento_extremo - Extreme weather event
 */
```

### Data Models & Entities

#### `src/entities/weather-forecast.entity.js`
- **Purpose**: Weather forecast data storage
- **Database Table**: `weather_forecasts`
- **Key Fields**:
  - `id`: UUID primary key
  - `station_id`: Weather station identifier
  - `forecast_date`: Forecast target date
  - `temperature_min`: Minimum temperature forecast
  - `temperature_max`: Maximum temperature forecast
  - `humidity`: Humidity percentage
  - `precipitation_probability`: Rain probability
  - `precipitation_amount`: Expected precipitation
  - `wind_speed`: Wind speed forecast
  - `weather_condition`: General weather condition
  - `frost_risk`: Frost risk assessment
  - `drought_risk`: Drought risk assessment
  - `created_at`: Record creation timestamp

#### `src/entities/weather-history.entity.js`
- **Purpose**: Historical weather data storage
- **Database Table**: `weather_history`
- **Key Fields**:
  - `id`: UUID primary key
  - `station_id`: SENAMHI station identifier
  - `record_date`: Historical record date
  - `temperature_min`: Recorded minimum temperature
  - `temperature_max`: Recorded maximum temperature
  - `precipitation`: Actual precipitation amount
  - `humidity`: Recorded humidity
  - `wind_speed`: Wind speed measurement
  - `weather_events`: Extreme weather events
  - `data_source`: Data source (SENAMHI, manual, etc.)
  - `quality_score`: Data quality assessment
  - `created_at`: Data ingestion timestamp

## Database Integration

### Database Schema
```sql
-- Weather Forecasts Table
CREATE TABLE weather_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id VARCHAR(50) NOT NULL,
    forecast_date DATE NOT NULL,
    temperature_min DECIMAL(5,2),
    temperature_max DECIMAL(5,2),
    humidity DECIMAL(5,2),
    precipitation_probability DECIMAL(5,2),
    precipitation_amount DECIMAL(7,2),
    wind_speed DECIMAL(5,2),
    weather_condition VARCHAR(100),
    frost_risk BOOLEAN DEFAULT FALSE,
    drought_risk BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weather History Table
CREATE TABLE weather_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    station_id VARCHAR(50) NOT NULL,
    record_date DATE NOT NULL,
    temperature_min DECIMAL(5,2),
    temperature_max DECIMAL(5,2),
    precipitation DECIMAL(7,2),
    humidity DECIMAL(5,2),
    wind_speed DECIMAL(5,2),
    weather_events TEXT,
    data_source VARCHAR(50) DEFAULT 'SENAMHI',
    quality_score INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_weather_forecasts_date ON weather_forecasts(forecast_date);
CREATE INDEX idx_weather_forecasts_station ON weather_forecasts(station_id);
CREATE INDEX idx_weather_history_date ON weather_history(record_date);
CREATE INDEX idx_weather_history_station ON weather_history(station_id);
```

### Data Operations
- **Forecast Storage**: Daily weather forecast persistence
- **Historical Data**: SENAMHI data ingestion and quality validation
- **Query Optimization**: Date and station-based indexing
- **Data Aggregation**: Monthly and seasonal weather summaries

## External API Integration

### SENAMHI API Integration
```javascript
async obtenerDatosSenamhi(estacion, fechaInicio, fechaFin) {
    try {
        const response = await firstValueFrom(
            this.httpService.get(`${this.senamhiBaseUrl}/datos`, {
                params: {
                    estacion,
                    fecha_inicio: fechaInicio,
                    fecha_fin: fechaFin,
                    formato: 'json'
                },
                headers: {
                    'Authorization': `Bearer ${this.senamhiApiKey}`,
                    'Content-Type': 'application/json'
                }
            }).pipe(timeout(15000))
        );
        
        return response.data;
    } catch (error) {
        this.logger.error('Error fetching SENAMHI data', error);
        throw new Error('Failed to retrieve weather data');
    }
}
```

### OpenWeatherMap Integration
```javascript
async getCurrentWeatherData() {
    const huancavelicaCoords = { lat: -12.7857, lon: -74.9757 };
    
    try {
        const response = await firstValueFrom(
            this.httpService.get(
                `${this.openWeatherBaseUrl}/weather`,
                {
                    params: {
                        lat: huancavelicaCoords.lat,
                        lon: huancavelicaCoords.lon,
                        appid: this.configService.get('OPENWEATHER_API_KEY'),
                        units: 'metric',
                        lang: 'es'
                    }
                }
            )
        );
        
        return this.processWeatherApiResponse(response.data);
    } catch (error) {
        this.logger.error('Error fetching current weather', error);
        return this.getFallbackWeatherData();
    }
}
```

## Climate Risk Analysis

### Frost Risk Assessment
The service implements sophisticated frost risk analysis:

```javascript
evaluarRiesgoHelada(temperaturaMinima, humedad, viento) {
    // Frost risk calculation based on multiple factors
    let riesgoHelada = false;
    let probabilidad = 0;
    
    // Temperature-based risk
    if (temperaturaMinima <= 2) {
        riesgoHelada = true;
        probabilidad = 90;
    } else if (temperaturaMinima <= 4) {
        probabilidad = 60;
    } else if (temperaturaMinima <= 6) {
        probabilidad = 30;
    }
    
    // Humidity adjustment
    if (humedad > 80) {
        probabilidad += 10;
    }
    
    // Wind speed adjustment
    if (viento < 5) {
        probabilidad += 15; // Low wind increases frost risk
    }
    
    return {
        riesgo: riesgoHelada,
        probabilidad: Math.min(probabilidad, 100),
        recomendaciones: this.generarRecomendacionesHelada(probabilidad)
    };
}
```

### Drought Analysis
```javascript
evaluarRiesgoSequia(precipitacion, diasSinLluvia, temperaturaMaxima) {
    let nivelRiesgo = 'bajo';
    let recomendaciones = [];
    
    // Precipitation analysis
    if (precipitacion < 5 && diasSinLluvia > 15) {
        nivelRiesgo = 'alto';
        recomendaciones.push('Implementar riego de emergencia');
        recomendaciones.push('Aplicar mulching para conservar humedad');
    } else if (precipitacion < 15 && diasSinLluvia > 10) {
        nivelRiesgo = 'medio';
        recomendaciones.push('Monitorear humedad del suelo');
        recomendaciones.push('Preparar sistemas de riego');
    }
    
    // High temperature adjustment
    if (temperaturaMaxima > 28) {
        if (nivelRiesgo === 'medio') nivelRiesgo = 'alto';
        else if (nivelRiesgo === 'bajo') nivelRiesgo = 'medio';
    }
    
    return {
        nivel: nivelRiesgo,
        precipitacion_requerida: Math.max(25 - precipitacion, 0),
        recomendaciones
    };
}
```

## Microservice Communication

### Alert Service Integration
```javascript
// Send climate alerts to Alert Service
async enviarAlertasClimaticas(alertas) {
    try {
        for (const alerta of alertas) {
            await firstValueFrom(
                this.alertClient.send('generate_weather_alert', {
                    type: alerta.tipo,
                    message: alerta.mensaje,
                    severity: alerta.severidad,
                    region: 'huancavelica',
                    data: alerta.datos_adicionales
                })
            );
        }
        
        this.logger.log(`Sent ${alertas.length} climate alerts`);
    } catch (error) {
        this.logger.error('Failed to send climate alerts', error);
    }
}
```

### Inbound Message Patterns
- `get_climate_alerts`: Request climate risk alerts
- `generate_weather_report`: Generate comprehensive weather reports
- `get_weather_data`: Fetch current weather conditions
- `save_historical_data`: Process and store SENAMHI data

## Weather Data Processing Pipeline

### Data Ingestion Flow
1. **Source Collection**: SENAMHI files, API data, manual inputs
2. **Data Validation**: Quality checks and error detection
3. **Format Standardization**: Convert to internal data structure
4. **Risk Calculation**: Compute agricultural risk factors
5. **Database Storage**: Persist processed data
6. **Alert Generation**: Create risk-based alerts

### Data Quality Assurance
```javascript
validarCalidadDatos(registro) {
    let puntajeCalidad = 100;
    const errores = [];
    
    // Temperature validation
    if (registro.temp_min < -20 || registro.temp_min > 50) {
        puntajeCalidad -= 30;
        errores.push('Temperatura mínima fuera de rango');
    }
    
    if (registro.temp_max < registro.temp_min) {
        puntajeCalidad -= 40;
        errores.push('Temperatura máxima menor que mínima');
    }
    
    // Precipitation validation
    if (registro.precipitacion < 0 || registro.precipitacion > 500) {
        puntajeCalidad -= 25;
        errores.push('Precipitación fuera de rango normal');
    }
    
    // Humidity validation
    if (registro.humedad < 0 || registro.humedad > 100) {
        puntajeCalidad -= 20;
        errores.push('Humedad fuera de rango válido');
    }
    
    return {
        puntaje: Math.max(puntajeCalidad, 0),
        errores,
        valido: puntajeCalidad >= 70
    };
}
```

## Error Handling & Resilience

### API Failure Handling
```javascript
async obtenerDatosConFallback() {
    try {
        // Primary: SENAMHI API
        return await this.obtenerDatosSenamhi();
    } catch (error) {
        this.logger.warn('SENAMHI API unavailable, trying OpenWeatherMap');
        
        try {
            // Secondary: OpenWeatherMap
            return await this.obtenerDatosOpenWeather();
        } catch (secondError) {
            this.logger.error('All weather APIs failed');
            
            // Tertiary: Historical averages
            return await this.obtenerPromediosHistoricos();
        }
    }
}
```

### Data Processing Errors
- **Invalid Data**: Skip malformed records with logging
- **Missing Data**: Use interpolation for missing values
- **API Timeouts**: Implement exponential backoff retry
- **Database Errors**: Queue data for later processing

## Configuration & Environment

### Environment Variables
```bash
# Weather APIs
SENAMHI_API_URL=https://api.senamhi.gob.pe
SENAMHI_API_KEY=your_senamhi_key
OPENWEATHER_API_KEY=your_openweather_key

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=weather_user
DB_PASSWORD=weather_pass
DB_NAME=weather_db

# Service Configuration
PORT=3002
ALERT_SERVICE_PORT=3001

# Data Processing
MAX_HISTORICAL_DAYS=365
FORECAST_DAYS=7
DATA_QUALITY_THRESHOLD=70
```

### Weather Station Configuration
```javascript
const estacionesHuancavelica = {
    'HV001': {
        nombre: 'Huancavelica Centro',
        latitud: -12.7857,
        longitud: -74.9757,
        altitud: 3660,
        cultivos_principales: ['papa', 'quinua', 'cebada']
    },
    'HV002': {
        nombre: 'Churcampa',
        latitud: -12.1367,
        longitud: -74.3858,
        altitud: 2950,
        cultivos_principales: ['maiz', 'papa', 'frijol']
    }
};
```

## Performance Optimization

### Caching Strategy
- **Weather Data**: 30-minute cache for current conditions
- **Forecasts**: 6-hour cache for forecast data
- **Historical Data**: Long-term caching for processed historical records
- **Risk Calculations**: Cache computed risk assessments

### Database Optimization
- **Indexing**: Date and station-based indexes for fast queries
- **Partitioning**: Monthly partitions for historical data
- **Aggregation**: Pre-computed monthly and seasonal summaries
- **Cleanup**: Automatic removal of old forecast data

## Monitoring & Analytics

### Key Metrics
- Weather data ingestion rates
- API response times and availability
- Risk alert generation frequency
- Data quality scores
- Service uptime and performance

### Health Checks
```javascript
async healthCheck() {
    const status = {
        service: 'weather-service',
        timestamp: new Date().toISOString(),
        status: 'healthy',
        components: {}
    };
    
    // Database connectivity
    try {
        await this.weatherRepository.count();
        status.components.database = 'healthy';
    } catch (error) {
        status.components.database = 'unhealthy';
        status.status = 'degraded';
    }
    
    // External APIs
    try {
        await this.testSenamhiConnection();
        status.components.senamhi_api = 'healthy';
    } catch (error) {
        status.components.senamhi_api = 'unhealthy';
    }
    
    return status;
}
```

## Testing & Development

### Test Coverage
- Unit tests for weather data processing
- Integration tests for external APIs
- Database operation testing
- Risk calculation validation

### Development Guidelines
1. **Data Validation**: Always validate weather data quality
2. **Error Handling**: Graceful degradation for API failures
3. **Performance**: Optimize database queries and caching
4. **Documentation**: Document all risk calculation algorithms
5. **Testing**: Test with various weather scenarios

The Weather Service provides critical meteorological intelligence for agricultural decision-making in Huancavelica, ensuring farmers receive accurate, timely, and actionable weather information to protect their crops and optimize farming practices.