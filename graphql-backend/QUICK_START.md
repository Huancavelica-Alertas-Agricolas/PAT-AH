# 🤖 Microservicio de IA - Inicio Rápido

## ⚡ Instalación Express

### 1. Prerrequisitos
```bash
# Verificar Node.js (requiere v16+)
node --version

# Si no tienes Node.js, descárgalo de: https://nodejs.org/
```

### 2. Instalación Automática (Recomendado)
```powershell
# En PowerShell (como administrador)
cd graphql-backend
powershell -ExecutionPolicy Bypass -File install-ai.ps1
```

### 3. Instalación Manual
```bash
# Crear directorios
mkdir uploads trained-models

# Instalar dependencias principales
npm install multer xlsx axios ml-regression-simple-linear ml-regression-multivariate-linear ml-matrix ml-stat @tensorflow/tfjs-node csv-parser

# Instalar tipos para TypeScript
npm install --save-dev @types/multer

# Configurar variables de entorno
cp .env.example .env
# Editar .env y agregar tu OPENWEATHER_API_KEY
```

### 4. Obtener API Key del Clima
1. Ir a [OpenWeatherMap](https://openweathermap.org/api)
2. Crear cuenta gratuita
3. Obtener API key
4. Agregar a `.env`: `OPENWEATHER_API_KEY=tu_api_key_aqui`

## 🚀 Inicio del Servidor

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

El servidor estará disponible en: `http://localhost:3001`

## ✅ Verificación

### Health Check
```bash
curl http://localhost:3001/ai/health
```

### Desde el navegador
Visita: `http://localhost:3001/ai/health`

## 📊 Primer Uso

### 1. Preparar Archivo Excel
Crea un archivo Excel con datos como:
```
| fecha      | temperatura | humedad | precipitacion | produccion |
|------------|-------------|---------|---------------|------------|
| 2024-01-01 | 25.5        | 65      | 12.3          | 4500       |
| 2024-01-02 | 24.2        | 68      | 8.7           | 4200       |
| ...        | ...         | ...     | ...           | ...        |
```

### 2. Subir Excel (usando curl)
```bash
curl -X POST -F "file=@datos.xlsx" http://localhost:3001/ai/upload-excel
```

### 3. Entrenar Modelo
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{
    "filePath": "./uploads/datos.xlsx",
    "targetColumn": "produccion", 
    "featureColumns": ["temperatura", "humedad", "precipitacion"],
    "modelType": "multivariate",
    "modelName": "modelo_test"
  }' \
  http://localhost:3001/ai/train-model
```

### 4. Hacer Predicción
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{
    "modelId": "model_XXXXXXXXX",
    "inputData": [25, 70, 15],
    "includeWeather": true,
    "location": {"city": "Lima"}
  }' \
  http://localhost:3001/ai/predict
```

## 🛠️ Solución de Problemas

### Error: "scripts está deshabilitada"
```powershell
# Ejecutar como administrador
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Error: "Cannot find module"
```bash
# Re-instalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: "API key no configurada"
```bash
# Verificar .env
cat .env | grep OPENWEATHER_API_KEY
# Debe mostrar: OPENWEATHER_API_KEY=tu_api_key_real
```

### Error: "Puerto en uso"
```bash
# Cambiar puerto en .env
echo "PORT=3002" >> .env
```

## 📚 Ejemplos Listos

### JavaScript Cliente
```bash
node examples/ai-client-example.js
```

### Postman Collection
Importa `postman/AI-Microservice.postman_collection.json`

## 🎯 Casos de Uso Típicos

### 🌾 Agricultura
- Predicción de rendimiento de cultivos
- Análisis de factores climáticos
- Optimización de siembra

### 📈 Análisis de Datos
- Regresión lineal y múltiple
- Redes neuronales para patrones complejos
- Análisis de series temporales

### 🌤️ Clima
- Datos meteorológicos en tiempo real
- Pronósticos automáticos
- Correlaciones clima-producción

## 📞 Soporte

- 📖 Documentación completa: `AI_MICROSERVICE_README.md`
- 🧪 Ejemplos: `examples/`
- 🐛 Problemas: Crear issue en el repositorio

## ⚡ Quick Commands

```bash
# Ver modelos entrenados
curl http://localhost:3001/ai/models

# Clima actual de Lima
curl "http://localhost:3001/ai/weather/current?city=Lima"

# Estado del sistema
curl http://localhost:3001/ai/health

# Análisis completo (si hay modelos)
curl -X POST -H "Content-Type: application/json" \
  -d '{"inputData": [25, 70, 10], "location": {"city": "Lima"}}' \
  http://localhost:3001/ai/analyze-complete
```

¡Ya estás listo para usar el microservicio de IA! 🎉
