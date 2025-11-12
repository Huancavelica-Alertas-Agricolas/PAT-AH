# Microservicio de IA - Análisis de Excel y Pronósticos Climáticos

Este microservicio proporciona capacidades de inteligencia artificial para analizar archivos Excel, entrenar modelos de machine learning y realizar pronósticos utilizando datos climáticos.

## 🚀 Características

### 📊 Análisis de Archivos Excel
- **Carga y procesamiento** de archivos Excel (.xlsx, .xls)
- **Validación de calidad** de datos
- **Estadísticas descriptivas** automáticas
- **Detección de datos faltantes**

### 🧠 Machine Learning
- **Regresión Lineal Simple**: Para relaciones lineales básicas
- **Regresión Multivariante**: Para análisis con múltiples variables
- **Redes Neuronales**: Para patrones complejos usando TensorFlow.js

### 🌤️ Integración Climática
- **API del clima en tiempo real** (OpenWeatherMap)
- **Pronósticos meteorológicos**
- **Datos históricos simulados**
- **Integración automática** en predicciones

## 📋 Requisitos Previos

### Dependencias del Sistema
- Node.js 16+
- NPM o Yarn
- Espacio en disco para modelos entrenados

### API Keys Requeridas
- **OpenWeatherMap API Key** (gratuita): [Obtener aquí](https://openweathermap.org/api)

## 🔧 Instalación

1. **Instalar dependencias**:
```bash
npm install
```

2. **Configurar variables de entorno**:
```bash
cp .env.example .env
```

3. **Editar `.env`** y agregar tu API key de OpenWeatherMap:
```bash
OPENWEATHER_API_KEY=tu_api_key_aqui
```

## 🔗 Endpoints de la API

### 📁 Gestión de Archivos Excel

#### `POST /ai/upload-excel`
Sube y procesa un archivo Excel.

**Parámetros:**
- `file`: Archivo Excel (multipart/form-data)

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "fileName": "datos.xlsx",
    "columns": ["fecha", "temperatura", "produccion"],
    "rowCount": 100
  },
  "statistics": {
    "totalRows": 100,
    "columnStatistics": {...}
  },
  "quality": {
    "isValid": true,
    "warnings": [],
    "recommendations": []
  }
}
```

### 🤖 Entrenamiento de Modelos

#### `POST /ai/train-model`
Entrena un modelo de machine learning.

**Body:**
```json
{
  "filePath": "./uploads/datos.xlsx",
  "targetColumn": "produccion",
  "featureColumns": ["temperatura", "humedad"],
  "modelType": "multivariate",
  "modelName": "modelo_produccion"
}
```

**Tipos de modelo disponibles:**
- `linear`: Regresión lineal simple (1 característica)
- `multivariate`: Regresión multivariante (múltiples características)
- `neural_network`: Red neuronal profunda

### 🔮 Predicciones

#### `POST /ai/predict`
Realiza una predicción con un modelo entrenado.

**Body:**
```json
{
  "modelId": "model_1699123456_abc123",
  "inputData": [25.5, 65],
  "includeWeather": true,
  "location": {
    "city": "Lima"
  }
}
```

#### `POST /ai/predict-with-weather`
Predicción con datos climáticos específicos.

**Body:**
```json
{
  "modelId": "model_1699123456_abc123",
  "inputData": [25.5, 65],
  "weatherData": {
    "temperature": 22.5,
    "humidity": 70,
    "precipitation": 0,
    "windSpeed": 5.2,
    "pressure": 1013
  }
}
```

### 📊 Gestión de Modelos

#### `GET /ai/models`
Lista todos los modelos entrenados.

#### `GET /ai/models/:id`
Obtiene información de un modelo específico.

#### `DELETE /ai/models/:id`
Elimina un modelo entrenado.

### 🌤️ Datos Climáticos

#### `GET /ai/weather/current`
Obtiene el clima actual.

**Parámetros de consulta:**
- `lat`, `lon`: Coordenadas geográficas
- `city`: Nombre de la ciudad

#### `GET /ai/weather/forecast`
Obtiene el pronóstico del tiempo.

**Parámetros de consulta:**
- `lat`, `lon`: Coordenadas geográficas
- `city`: Nombre de la ciudad
- `days`: Número de días (default: 5)

### 🏥 Monitoreo

#### `GET /ai/health`
Estado de salud del microservicio.

## 📈 Ejemplos de Uso

### Ejemplo 1: Análisis Completo de Producción Agrícola

```javascript
// 1. Subir archivo Excel con datos de producción
const formData = new FormData();
formData.append('file', excelFile);

const uploadResponse = await fetch('/ai/upload-excel', {
  method: 'POST',
  body: formData
});

// 2. Entrenar modelo multivariante
const trainingResponse = await fetch('/ai/train-model', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    filePath: uploadResponse.data.fileInfo.path,
    targetColumn: 'produccion_kg',
    featureColumns: ['temperatura_avg', 'humedad_avg', 'precipitacion'],
    modelType: 'neural_network',
    modelName: 'predictor_produccion_maiz'
  })
});

// 3. Realizar predicción con datos climáticos
const predictionResponse = await fetch('/ai/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    modelId: trainingResponse.modelId,
    inputData: [24.5, 68, 15.2], // temp, humedad, precipitación
    includeWeather: true,
    location: { city: 'Huancavelica' }
  })
});
```

### Ejemplo 2: Análisis de Rendimiento de Cultivos

```javascript
// Predicción con múltiples modelos para comparación
const analysisResponse = await fetch('/ai/analyze-complete', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    inputData: [22.0, 75, 8.5, 1.2], // temp, humedad, precipitación, viento
    location: { lat: -12.0464, lon: -77.0428 }, // Lima, Perú
    includeWeather: true
  })
});

console.log('Predicción promedio:', analysisResponse.averagePrediction);
console.log('Confianza promedio:', analysisResponse.summary.averageConfidence);
```

## 🔬 Tipos de Análisis Soportados

### Agricultura
- **Predicción de rendimientos** de cultivos
- **Análisis de factores climáticos** en la producción
- **Optimización de siembra** basada en condiciones

### Datos Meteorológicos
- **Correlaciones clima-producción**
- **Análisis estacional** automático
- **Predicciones a corto plazo**

### Machine Learning Avanzado
- **Redes neuronales profundas** para patrones complejos
- **Validación cruzada** automática
- **Métricas de rendimiento** (R², RMSE, MSE)

## ⚙️ Configuración Avanzada

### Configuración de Redes Neuronales
```json
{
  "neuralNetworkConfig": {
    "hiddenLayers": [128, 64, 32],
    "epochs": 200,
    "learningRate": 0.001,
    "dropout": 0.3
  }
}
```

### Límites del Sistema
- **Tamaño máximo de archivo**: 10MB
- **Mínimo de datos para entrenamiento**: 10 filas
- **Máximo de características**: 50
- **Modelos concurrentes**: 10

## 🛠️ Solución de Problemas

### Error: "No se pudieron obtener datos del clima"
- Verificar que la API key de OpenWeatherMap esté configurada
- Comprobar conectividad a internet
- Verificar límites de la API gratuita

### Error: "Dataset muy pequeño"
- El modelo requiere al menos 50 filas para entrenamiento óptimo
- Considerar recopilar más datos o usar técnicas de data augmentation

### Error: "Modelo no encontrado"
- Verificar que el ID del modelo sea correcto
- Comprobar que el modelo no haya sido eliminado

## 📝 Notas de Desarrollo

- Los modelos se guardan en `./trained-models/`
- Los archivos subidos se almacenan en `./uploads/`
- Se recomienda hacer backup periódico de los modelos entrenados
- Para producción, considerar usar un almacenamiento en la nube

## 🤝 Contribuir

1. Fork del repositorio
2. Crear una rama para tu feature
3. Hacer commit de los cambios
4. Crear un Pull Request

## 📄 Licencia

MIT License - ver archivo LICENSE para más detalles.
