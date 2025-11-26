# Alert Service Documentation

## Overview
The Alert Service is a core microservice in the Agricultural Alert System for Huancavelica that manages agricultural alerts, user subscriptions, and coordinates with weather and notification services to provide timely alerts to farmers.

## Architecture & Technology Stack

### Core Technologies
- **Framework**: NestJS (v11.1.6) with microservices architecture
- **Language**: JavaScript (ES6+) with CommonJS modules
- **Database**: PostgreSQL with TypeORM
- **Communication**: TCP-based microservice communication via RxJS
- **Monitoring**: Prometheus metrics integration

### Service Dependencies
- **Weather Service**: Gets climate data and weather alerts
- **Notification Service**: Sends email notifications to users
- **User Service**: Manages user information and preferences

## File Structure & Components

### Core Files

#### `src/main.js`
- **Purpose**: Application bootstrap and microservice configuration
- **Key Features**:
  - TCP microservice setup on port 3001
  - Global validation pipes and exception filters
  - Microservice listener initialization

#### `src/app.module.js`
- **Purpose**: Main application module configuration
- **Configuration**:
  - PostgreSQL database connection with TypeORM
  - Entity registration (Alert, UserAlert)
  - Client service connections (Weather, Notification, User services)
  - Prometheus monitoring integration

#### `src/alert.controller.js`
- **Purpose**: HTTP and microservice message handlers
- **Key Endpoints**:
  - `generateWeatherAlert()`: Creates weather-based alerts
  - `generateFrostAlert()`: Creates frost warning alerts
  - `getUserAlerts()`: Retrieves user-specific alerts
  - `markAlertAsRead()`: Updates alert read status
  - `subscribeToAlerts()`: Manages user alert subscriptions
  - `getAlertHistory()`: Returns historical alert data

#### `src/alert.service.js`
- **Purpose**: Core business logic for alert management
- **Key Methods**:
  - `generateWeatherAlert(data)`: Orchestrates weather alert creation and notification
  - `generateFrostAlert(data)`: Handles frost-specific alert logic
  - `getUserAlerts(userId)`: Database queries for user alerts
  - `createAlert(alertData)`: Alert creation with database persistence
  - `notifyUsers(alertData, users)`: User notification coordination
  - `subscribeUserToAlerts(userId, alertTypes)`: Subscription management

### Data Models

#### `src/entities/alert.entity.js`
- **Purpose**: Main alert entity definition
- **Database Table**: `alerts`
- **Key Fields**:
  - `id`: UUID primary key
  - `type`: Alert type (weather, frost, drought)
  - `message`: Alert content
  - `severity`: Alert severity level
  - `created_at`: Timestamp
  - `valid_until`: Alert expiration
  - `data`: JSON metadata
  - `user_alerts`: Relationship to user subscriptions

#### `src/entities/user-alert.entity.js`
- **Purpose**: User-alert relationship management
- **Database Table**: `user_alerts`
- **Key Fields**:
  - `id`: UUID primary key
  - `user_id`: Foreign key to user
  - `alert_id`: Foreign key to alert
  - `is_read`: Read status tracking
  - `created_at`: Subscription timestamp
  - `alert`: ManyToOne relationship to Alert entity

#### `src/entities/alert-canal.entity.js`
- **Purpose**: Alert distribution channel management
- **Database Table**: `alert_channels`
- **Key Fields**:
  - `id`: Primary key
  - `channel_type`: Distribution method (email, sms, push)
  - `channel_config`: Channel-specific configuration
  - `is_active`: Channel status
  - `priority`: Delivery priority
  - `last_used`: Last usage timestamp
  - `error_log`: Error tracking
  - `metadata`: Additional channel data

#### `src/dto/create-alert.dto.js`
- **Purpose**: Data validation for alert creation
- **Validation Rules**:
  - `type`: Required string (alert type)
  - `message`: Required string (alert content)
  - `validUntil`: Required date string
  - `severity`: Optional string (severity level)
  - `priority`: Optional number (priority level)

## Database Integration

### Database Schema
The service uses PostgreSQL with the following table structure:

```sql
-- Alerts table
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL,
    message TEXT,
    severity VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    data JSONB
);

-- User alerts relationship
CREATE TABLE user_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alert channels
CREATE TABLE alert_channels (
    id SERIAL PRIMARY KEY,
    channel_type VARCHAR(50) NOT NULL,
    channel_config JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 1,
    last_used TIMESTAMP,
    error_log TEXT,
    metadata JSONB,
    alert_id UUID REFERENCES alerts(id),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Database Operations
- **Create Operations**: New alert insertion with user relationship creation
- **Read Operations**: User-specific alert queries with filtering
- **Update Operations**: Alert read status updates
- **Relationship Management**: User-alert many-to-many relationships

## Microservice Communication

### Outbound Services

#### Weather Service Integration
```javascript
// Climate data request
const climateData = await firstValueFrom(
    this.weatherClient.send('get_climate_alerts', { region: 'huancavelica' })
);

// Weather report generation
const weatherReport = await firstValueFrom(
    this.weatherClient.send('generate_weather_report', { date: new Date() })
);
```

#### Notification Service Integration
```javascript
// Email notification dispatch
const notificationResult = await firstValueFrom(
    this.notificationClient.send('send_email_notification', {
        email: user.email,
        userName: user.name,
        subject: 'Agricultural Alert',
        template: 'weather-alert',
        data: alertData
    })
);
```

#### User Service Integration
```javascript
// User data retrieval
const users = await firstValueFrom(
    this.userClient.send('get_users_by_region', { region })
);
```

### Inbound Message Patterns
- `generate_weather_alert`: Weather alert creation
- `generate_frost_alert`: Frost warning generation  
- `get_user_alerts`: User alert retrieval
- `mark_alert_read`: Alert status updates
- `subscribe_alerts`: Subscription management
- `get_alert_history`: Historical data access

## Business Logic Flow

### Weather Alert Generation Process
1. **Data Collection**: Receive weather data from Weather Service
2. **Risk Assessment**: Analyze weather patterns for agricultural risks
3. **Alert Creation**: Generate appropriate alert messages
4. **User Targeting**: Identify affected users by region/crop type
5. **Database Persistence**: Store alert and user relationships
6. **Notification Dispatch**: Send alerts via Notification Service
7. **Response Tracking**: Monitor delivery and read status

### Frost Alert Workflow
1. **Temperature Monitoring**: Monitor temperature forecasts
2. **Risk Calculation**: Calculate frost probability and impact
3. **Severity Assessment**: Determine alert severity level
4. **Crop-Specific Alerts**: Generate crop-specific recommendations
5. **Urgent Delivery**: Prioritize frost alerts for immediate delivery

## Error Handling & Logging

### Error Patterns
- **Database Errors**: PostgreSQL connection and query failures
- **Service Communication**: Inter-service communication timeouts
- **Validation Errors**: Invalid alert data or missing fields
- **User Management**: Invalid user IDs or subscription errors

### Logging Strategy
```javascript
// Service-level logging
this.logger = new Logger(AlertService.name);

// Operation logging
this.logger.log('Generating weather alert for region: ' + region);
this.logger.error('Failed to create alert', error.stack);
this.logger.warn('User not found for alert notification: ' + userId);
```

## Configuration & Environment

### Environment Variables
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=admin
DB_PASSWORD=admin
DB_NAME=agro_dev

# Service Ports
PORT=3001
WEATHER_SERVICE_PORT=3002
NOTIFICATION_SERVICE_PORT=3003
USER_SERVICE_PORT=3004

# Application Settings
NODE_ENV=development
```

### Service Configuration
- **TCP Port**: 3001 (default)
- **Database**: PostgreSQL with TypeORM
- **Monitoring**: Prometheus metrics on `/metrics`
- **Health Check**: Service health monitoring

## Performance & Monitoring

### Metrics Collection
- Alert generation rates
- Database query performance
- Inter-service communication latency
- Error rates and patterns

### Health Monitoring
- Database connectivity
- Service availability
- Memory and CPU usage
- Message queue status

## Development & Testing

### Testing Files
- `src/alert.service.spec.js`: Unit tests for AlertService
- Database testing with in-memory PostgreSQL
- Microservice communication mocking

### Development Guidelines
1. **Code Structure**: Follow NestJS patterns and dependency injection
2. **Error Handling**: Comprehensive try-catch blocks with logging
3. **Database Queries**: Use TypeORM repository patterns
4. **Service Communication**: Handle timeouts and retries
5. **Data Validation**: Validate all incoming data

## Security Considerations

### Data Protection
- UUID-based entity identification
- Input validation and sanitization
- Database query parameterization
- Secure inter-service communication

### Access Control
- User-based alert filtering
- Regional access restrictions
- Alert read status privacy

## Deployment & Operations

### Docker Integration
- Dockerfile for containerized deployment
- Multi-stage builds for production optimization
- Environment-based configuration

### Scaling Considerations
- Horizontal scaling via multiple instances
- Database connection pooling
- Message queue load balancing
- Caching for frequently accessed data

This alert service serves as the central coordination hub for agricultural alerts in the Huancavelica region, ensuring farmers receive timely and relevant information to protect their crops and optimize agricultural practices.