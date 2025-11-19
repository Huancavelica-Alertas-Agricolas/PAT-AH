# Notification Service Documentation

## Overview
The Notification Service is a specialized microservice responsible for handling all communication and notification delivery within the Agricultural Alert System for Huancavelica. It manages email delivery, template processing, and ensures reliable message delivery to farmers and agricultural stakeholders.

## Architecture & Technology Stack

### Core Technologies
- **Framework**: NestJS (v11.1.6) with microservices architecture
- **Language**: JavaScript (ES6+) with CommonJS modules
- **Email Engine**: @nestjs-modules/mailer with Nodemailer
- **Template Engine**: Handlebars for dynamic email content
- **Communication**: TCP-based microservice architecture
- **Configuration**: Environment-based configuration management

### External Integrations
- **SMTP Providers**: Gmail, SendGrid, or custom SMTP servers
- **Template System**: Handlebars templates for email formatting
- **File System**: Template file management and asset handling

## File Structure & Components

### Core Service Files

#### `src/main.js`
- **Purpose**: Microservice bootstrap and configuration
- **Key Features**:
  - TCP microservice setup on port 3003
  - Global validation pipes and exception handling
  - Mail service integration and startup validation

#### `src/app.module.js`
- **Purpose**: Main application module and dependency configuration
- **Module Structure**:
  - Configuration module for environment variables
  - Mail module integration
  - Prometheus monitoring setup
  - Service controllers and providers registration

#### `src/notification.controller.js`
- **Purpose**: Microservice message pattern handlers and notification routing
- **Message Patterns**:
  - `send_email_notification`: General email sending endpoint
  - `send_weather_alert`: Weather-specific alert notifications
  - `send_frost_alert`: Urgent frost warning notifications
  - `send_bulk_notifications`: Batch notification processing
  - `get_notification_status`: Delivery status tracking
  - `send_welcome_email`: User onboarding emails

#### `src/notification.service.js`
- **Purpose**: Core notification orchestration and business logic
- **Key Responsibilities**:
  - Message routing and priority handling
  - Delivery status tracking and logging
  - Error handling and retry mechanisms
  - Template selection and data preparation

### Email Processing Components

#### `src/mail/mail.service.js`
- **Purpose**: Email delivery engine and SMTP integration
- **Core Capabilities**:
  - **Template Processing**: Dynamic email content generation
  - **SMTP Management**: Connection pooling and error handling
  - **Delivery Tracking**: Success/failure monitoring
  - **Attachment Handling**: File attachment processing
  - **Priority Queuing**: Urgent vs. standard delivery

**Key Methods**:
```javascript
async sendEmail(to, subject, template, context, attachments = []) {
    try {
        // Template processing
        const processedContent = await this.processTemplate(template, context);
        
        // Email configuration
        const mailOptions = {
            to,
            subject,
            html: processedContent,
            attachments: this.processAttachments(attachments)
        };
        
        // Send with retry logic
        const result = await this.sendWithRetry(mailOptions);
        
        // Log delivery status
        this.logDeliveryStatus(to, subject, result);
        
        return result;
    } catch (error) {
        this.logger.error(`Email delivery failed: ${to}`, error);
        throw error;
    }
}
```

#### `src/mail/mail.module.js`
- **Purpose**: Mail service configuration and SMTP setup
- **Configuration Features**:
  - **SMTP Provider Setup**: Gmail, SendGrid, custom SMTP
  - **Template Engine**: Handlebars integration
  - **Authentication**: SMTP credentials management
  - **Template Directory**: Template file location configuration

**SMTP Configuration**:
```javascript
const mailConfig = {
    transport: {
        host: configService.get('SMTP_HOST') || 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: configService.get('SMTP_USER'),
            pass: configService.get('SMTP_PASS'),
        },
    },
    defaults: {
        from: `"${configService.get('MAIL_FROM') || 'Agro-Alertas'}" <${configService.get('SMTP_USER')}>`,
    },
    template: {
        dir: '/app/dist/templates',
        adapter: new HandlebarsAdapter(),
        options: {
            strict: false,
        },
    },
};
```

### Error Handling & Logging

#### `src/all-exceptions.filter.js`
- **Purpose**: Global exception handling for the notification service
- **Error Categories**:
  - **SMTP Errors**: Connection failures, authentication issues
  - **Template Errors**: Missing templates, rendering failures
  - **Validation Errors**: Invalid email addresses, missing data
  - **Rate Limiting**: SMTP provider rate limit handling

```javascript
class AllExceptionsFilter {
    catch(exception, host) {
        const ctx = host.switchToRpc();
        const ctxType = host.getType();
        
        let message = 'Internal server error';
        
        if (exception instanceof RpcException) {
            message = exception.message;
        } else if (exception instanceof Error) {
            message = exception.message;
            
            // Specific SMTP error handling
            if (message.includes('SMTP')) {
                this.handleSmtpError(exception);
            }
        }
        
        this.logger.error('Notification exception', { 
            type: ctxType, 
            message, 
            stack: exception?.stack 
        });
    }
    
    handleSmtpError(error) {
        // Implement SMTP-specific error handling
        // - Retry logic for temporary failures
        // - Alternative SMTP provider switching
        // - Queue messages for later delivery
    }
}
```

### Logger Integration

#### `src/logger.js`
- **Purpose**: Centralized logging for notification operations
- **Log Categories**:
  - **Delivery Logs**: Email send success/failure tracking
  - **Performance Logs**: Response times and throughput
  - **Error Logs**: Detailed error information for debugging
  - **Audit Logs**: User activity and security events

```javascript
const logger = {
    info: (message, meta = {}) => {
        console.log(JSON.stringify({
            level: 'info',
            timestamp: new Date().toISOString(),
            service: 'notification-service',
            message,
            ...meta
        }));
    },
    
    error: (message, error = null) => {
        console.error(JSON.stringify({
            level: 'error',
            timestamp: new Date().toISOString(),
            service: 'notification-service',
            message,
            error: error?.message,
            stack: error?.stack
        }));
    },
    
    warn: (message, meta = {}) => {
        console.warn(JSON.stringify({
            level: 'warn',
            timestamp: new Date().toISOString(),
            service: 'notification-service',
            message,
            ...meta
        }));
    }
};
```

## Email Template System

### Template Structure
The service uses Handlebars templates for dynamic email content:

```
/templates/
├── weather-alert.hbs           # Weather alert notifications
├── frost-alert.hbs            # Urgent frost warnings
├── drought-alert.hbs          # Drought notifications
├── welcome.hbs                # User welcome emails
├── report-summary.hbs         # Weekly/monthly reports
└── partials/
    ├── header.hbs            # Email header component
    ├── footer.hbs            # Email footer component
    └── alert-card.hbs        # Alert display component
```

### Template Examples

#### Weather Alert Template (`weather-alert.hbs`)
```handlebars
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Alerta Climática - {{region}}</title>
    <style>
        .alert-card {
            background: {{#if (eq severity 'high')}}#ff4444{{else}}#ffa500{{/if}};
            padding: 20px;
            border-radius: 8px;
            margin: 10px 0;
        }
        .alert-title {
            font-size: 18px;
            font-weight: bold;
            color: white;
        }
        .alert-message {
            color: white;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    {{> header userName=userName}}
    
    <div class="alert-card">
        <div class="alert-title">
            🌤️ Alerta Climática para {{region}}
        </div>
        <div class="alert-message">
            {{message}}
        </div>
        
        {{#if weatherData}}
        <div class="weather-details">
            <p><strong>Temperatura:</strong> {{weatherData.temperature}}°C</p>
            <p><strong>Precipitación:</strong> {{weatherData.precipitation}}mm</p>
            <p><strong>Humedad:</strong> {{weatherData.humidity}}%</p>
        </div>
        {{/if}}
        
        {{#if recommendations}}
        <div class="recommendations">
            <h3>Recomendaciones:</h3>
            <ul>
                {{#each recommendations}}
                <li>{{this}}</li>
                {{/each}}
            </ul>
        </div>
        {{/if}}
    </div>
    
    {{> footer}}
</body>
</html>
```

#### Frost Alert Template (`frost-alert.hbs`)
```handlebars
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>🥶 Alerta de Helada - URGENTE</title>
    <style>
        .frost-alert {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px;
            border-radius: 10px;
            text-align: center;
        }
        .urgency-banner {
            background: #ff0000;
            color: white;
            padding: 10px;
            margin: -25px -25px 20px -25px;
            border-radius: 10px 10px 0 0;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="frost-alert">
        <div class="urgency-banner">
            ⚠️ ALERTA URGENTE DE HELADA ⚠️
        </div>
        
        <h2>{{userName}}, protege tus cultivos</h2>
        
        <div class="frost-info">
            <p><strong>Temperatura mínima esperada:</strong> {{minTemperature}}°C</p>
            <p><strong>Probabilidad de helada:</strong> {{frostProbability}}%</p>
            <p><strong>Hora estimada:</strong> {{estimatedTime}}</p>
        </div>
        
        <div class="protection-measures">
            <h3>🛡️ Medidas de Protección Inmediatas:</h3>
            <ul style="text-align: left;">
                {{#each protectionMeasures}}
                <li>{{this}}</li>
                {{/each}}
            </ul>
        </div>
        
        <p><em>Actúa ahora para minimizar el daño a tus cultivos</em></p>
    </div>
</body>
</html>
```

## Microservice Communication

### Inbound Message Patterns

The notification service responds to these message patterns:

#### `send_email_notification`
```javascript
/**
 * General email notification endpoint
 * @param {Object} data
 * @param {string} data.email - Recipient email
 * @param {string} data.userName - Recipient name
 * @param {string} data.subject - Email subject
 * @param {string} data.template - Template name
 * @param {Object} data.data - Template variables
 * @param {Array} data.attachments - File attachments
 */
async sendEmailNotification(data) {
    const { email, userName, subject, template, data: templateData, attachments } = data;
    
    try {
        const result = await this.mailService.sendEmail(
            email,
            subject,
            template,
            { userName, ...templateData },
            attachments
        );
        
        return {
            success: true,
            messageId: result.messageId,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        this.logger.error('Failed to send email notification', error);
        return {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}
```

#### `send_weather_alert`
```javascript
/**
 * Weather-specific alert notifications
 * @param {Object} data
 * @param {string} data.email - Recipient email
 * @param {string} data.userName - User name
 * @param {string} data.region - Geographic region
 * @param {Object} data.weatherData - Weather information
 * @param {Array} data.recommendations - Action recommendations
 */
async sendWeatherAlert(data) {
    const subject = `🌤️ Alerta Climática para ${data.region}`;
    
    return await this.sendEmailNotification({
        email: data.email,
        userName: data.userName,
        subject,
        template: 'weather-alert',
        data: {
            region: data.region,
            weatherData: data.weatherData,
            recommendations: data.recommendations,
            severity: data.severity || 'medium'
        }
    });
}
```

#### `send_frost_alert`
```javascript
/**
 * Urgent frost warning notifications
 * @param {Object} data
 * @param {string} data.email - Recipient email
 * @param {string} data.userName - User name
 * @param {number} data.minTemperature - Minimum temperature forecast
 * @param {number} data.frostProbability - Frost probability percentage
 * @param {Array} data.protectionMeasures - Protection recommendations
 */
async sendFrostAlert(data) {
    const subject = `🥶 ALERTA URGENTE DE HELADA - ${data.userName}`;
    
    // High priority delivery
    return await this.mailService.sendEmailWithPriority(
        data.email,
        subject,
        'frost-alert',
        {
            userName: data.userName,
            minTemperature: data.minTemperature,
            frostProbability: data.frostProbability,
            protectionMeasures: data.protectionMeasures,
            estimatedTime: data.estimatedTime || 'Madrugada'
        },
        'high'
    );
}
```

#### `send_bulk_notifications`
```javascript
/**
 * Batch notification processing
 * @param {Object} data
 * @param {Array} data.recipients - Array of recipient objects
 * @param {string} data.template - Template name
 * @param {Object} data.commonData - Shared template data
 */
async sendBulkNotifications(data) {
    const { recipients, template, commonData } = data;
    const results = [];
    
    // Process in batches to avoid overwhelming SMTP server
    const batchSize = 10;
    
    for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (recipient) => {
            try {
                const result = await this.sendEmailNotification({
                    email: recipient.email,
                    userName: recipient.userName,
                    subject: this.generateSubjectForRecipient(recipient, commonData),
                    template,
                    data: { ...commonData, ...recipient.customData }
                });
                
                return { recipient: recipient.email, success: true, result };
            } catch (error) {
                this.logger.error(`Bulk notification failed for ${recipient.email}`, error);
                return { recipient: recipient.email, success: false, error: error.message };
            }
        });
        
        const batchResults = await Promise.allSettled(batchPromises);
        results.push(...batchResults.map(r => r.value));
        
        // Rate limiting delay
        if (i + batchSize < recipients.length) {
            await this.delay(1000); // 1-second delay between batches
        }
    }
    
    return {
        totalSent: results.filter(r => r.success).length,
        totalFailed: results.filter(r => !r.success).length,
        details: results
    };
}
```

### Service Integration Examples

#### Alert Service Integration
```javascript
// Alert service sends notifications via this service
const notificationResult = await firstValueFrom(
    this.notificationClient.send('send_weather_alert', {
        email: user.email,
        userName: user.name,
        region: 'Huancavelica',
        weatherData: {
            temperature: 15,
            precipitation: 5,
            humidity: 80
        },
        recommendations: [
            'Cubrir cultivos sensibles',
            'Regar antes del amanecer',
            'Monitorear temperatura nocturna'
        ]
    })
);
```

## Email Delivery Management

### Delivery Status Tracking
```javascript
class DeliveryTracker {
    constructor() {
        this.deliveryLog = new Map();
    }
    
    logDelivery(messageId, recipient, status, timestamp = new Date()) {
        this.deliveryLog.set(messageId, {
            recipient,
            status, // 'sent', 'delivered', 'failed', 'bounced'
            timestamp,
            attempts: 1
        });
    }
    
    async getDeliveryStatus(messageId) {
        return this.deliveryLog.get(messageId) || { status: 'unknown' };
    }
    
    async retryFailedDelivery(messageId) {
        const delivery = this.deliveryLog.get(messageId);
        if (delivery && delivery.status === 'failed' && delivery.attempts < 3) {
            delivery.attempts++;
            // Implement retry logic
            return await this.attemptRedelivery(delivery);
        }
        return false;
    }
}
```

### SMTP Provider Failover
```javascript
async sendWithFailover(mailOptions) {
    const providers = [
        { name: 'primary', config: this.primarySmtpConfig },
        { name: 'secondary', config: this.secondarySmtpConfig },
        { name: 'tertiary', config: this.tertiarySmtpConfig }
    ];
    
    for (const provider of providers) {
        try {
            this.logger.info(`Attempting delivery via ${provider.name}`);
            const result = await this.sendViaProvider(mailOptions, provider.config);
            this.logger.info(`Successfully sent via ${provider.name}`);
            return result;
        } catch (error) {
            this.logger.warn(`Provider ${provider.name} failed: ${error.message}`);
            if (provider === providers[providers.length - 1]) {
                throw error; // Last provider failed
            }
        }
    }
}
```

## Configuration & Environment

### Environment Variables
```bash
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Alternative SMTP (SendGrid)
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=alerts@your-domain.com

# Service Configuration
PORT=3003
NODE_ENV=production

# Email Settings
MAIL_FROM="Agro-Alertas Huancavelica"
MAX_RECIPIENTS_PER_EMAIL=50
RETRY_ATTEMPTS=3
RETRY_DELAY=5000

# Template Configuration
TEMPLATE_DIR=/app/templates
ENABLE_TEMPLATE_CACHE=true
TEMPLATE_CACHE_TTL=3600
```

### Mail Provider Configurations

#### Gmail Configuration
```javascript
const gmailConfig = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD // App-specific password
    },
    tls: {
        rejectUnauthorized: false
    }
};
```

#### SendGrid Configuration
```javascript
const sendGridConfig = {
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
    }
};
```

## Performance & Optimization

### Email Queue Management
```javascript
class EmailQueue {
    constructor(maxConcurrent = 5) {
        this.queue = [];
        this.processing = 0;
        this.maxConcurrent = maxConcurrent;
    }
    
    async addToQueue(emailData, priority = 'normal') {
        const queueItem = {
            id: this.generateId(),
            emailData,
            priority,
            timestamp: new Date(),
            attempts: 0
        };
        
        // Priority insertion
        if (priority === 'high') {
            this.queue.unshift(queueItem);
        } else {
            this.queue.push(queueItem);
        }
        
        this.processQueue();
        return queueItem.id;
    }
    
    async processQueue() {
        if (this.processing >= this.maxConcurrent || this.queue.length === 0) {
            return;
        }
        
        this.processing++;
        const item = this.queue.shift();
        
        try {
            await this.processEmail(item);
        } catch (error) {
            await this.handleEmailError(item, error);
        } finally {
            this.processing--;
            this.processQueue(); // Process next item
        }
    }
}
```

### Template Caching
```javascript
class TemplateCache {
    constructor(ttl = 3600000) { // 1 hour TTL
        this.cache = new Map();
        this.ttl = ttl;
    }
    
    async getTemplate(templateName) {
        const cached = this.cache.get(templateName);
        
        if (cached && (Date.now() - cached.timestamp) < this.ttl) {
            return cached.template;
        }
        
        // Load and cache template
        const template = await this.loadTemplate(templateName);
        this.cache.set(templateName, {
            template,
            timestamp: Date.now()
        });
        
        return template;
    }
    
    invalidateTemplate(templateName) {
        this.cache.delete(templateName);
    }
    
    clearCache() {
        this.cache.clear();
    }
}
```

## Security & Best Practices

### Email Security
- **SMTP Authentication**: Secure credential management
- **TLS Encryption**: Encrypted email transmission
- **Rate Limiting**: Prevent spam and abuse
- **Input Validation**: Sanitize email addresses and content
- **Template Sanitization**: Prevent XSS in email templates

### Privacy Protection
```javascript
function sanitizeEmailContent(content, userPreferences) {
    // Remove sensitive information based on user preferences
    if (!userPreferences.shareWeatherData) {
        content = content.replace(/temperatura:\s*\d+°C/gi, 'temperatura: [privado]');
    }
    
    // Remove personal identifiers if requested
    if (!userPreferences.includePersonalInfo) {
        content = content.replace(/\b\d{8}\b/g, '[DNI]'); // Hide DNI numbers
    }
    
    return content;
}
```

## Monitoring & Analytics

### Email Metrics
```javascript
class EmailMetrics {
    constructor() {
        this.metrics = {
            emailsSent: 0,
            emailsFailed: 0,
            averageDeliveryTime: 0,
            bounceRate: 0,
            openRate: 0,
            clickThroughRate: 0
        };
    }
    
    recordEmailSent(deliveryTime) {
        this.metrics.emailsSent++;
        this.updateAverageDeliveryTime(deliveryTime);
    }
    
    recordEmailFailed(errorType) {
        this.metrics.emailsFailed++;
        this.recordErrorType(errorType);
    }
    
    getMetrics() {
        return {
            ...this.metrics,
            successRate: this.calculateSuccessRate(),
            timestamp: new Date().toISOString()
        };
    }
}
```

### Health Monitoring
```javascript
async performHealthCheck() {
    const health = {
        service: 'notification-service',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        components: {}
    };
    
    // SMTP connectivity check
    try {
        await this.testSmtpConnection();
        health.components.smtp = 'healthy';
    } catch (error) {
        health.components.smtp = 'unhealthy';
        health.status = 'degraded';
    }
    
    // Template system check
    try {
        await this.validateTemplates();
        health.components.templates = 'healthy';
    } catch (error) {
        health.components.templates = 'unhealthy';
        health.status = 'degraded';
    }
    
    // Queue status check
    health.components.queue = {
        status: 'healthy',
        queueLength: this.emailQueue.length,
        processing: this.emailQueue.processing
    };
    
    return health;
}
```

## Testing & Development

### Email Testing
```javascript
// Email service test utilities
const testEmail = {
    to: 'test@example.com',
    subject: 'Test Weather Alert',
    template: 'weather-alert',
    data: {
        userName: 'Test User',
        region: 'Huancavelica',
        weatherData: {
            temperature: 15,
            precipitation: 10,
            humidity: 75
        },
        recommendations: ['Test recommendation']
    }
};

async function runEmailTest() {
    try {
        const result = await notificationService.sendEmailNotification(testEmail);
        console.log('Test email sent successfully:', result);
    } catch (error) {
        console.error('Test email failed:', error);
    }
}
```

### Template Testing
```javascript
async function testTemplate(templateName, testData) {
    try {
        const rendered = await this.mailService.renderTemplate(templateName, testData);
        
        // Validate HTML structure
        const isValidHtml = this.validateHtmlStructure(rendered);
        
        // Check for required elements
        const hasRequiredElements = this.checkRequiredElements(rendered, templateName);
        
        return {
            valid: isValidHtml && hasRequiredElements,
            html: rendered,
            errors: this.getTemplateErrors(rendered)
        };
    } catch (error) {
        return {
            valid: false,
            errors: [error.message]
        };
    }
}
```

The Notification Service ensures reliable, timely, and professionally formatted communication delivery to agricultural stakeholders in Huancavelica, supporting the overall mission of protecting crops and optimizing farming practices through effective information dissemination.