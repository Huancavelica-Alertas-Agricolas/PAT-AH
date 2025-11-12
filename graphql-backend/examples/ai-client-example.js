// Ejemplo de uso del microservicio de IA
// Este archivo muestra cómo interactuar con todas las funcionalidades

const API_BASE = 'http://localhost:3001/ai';

class AIClient {
  constructor(baseUrl = API_BASE) {
    this.baseUrl = baseUrl;
  }

  // Subir y procesar archivo Excel
  async uploadExcel(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/upload-excel`, {
      method: 'POST',
      body: formData
    });

    return await response.json();
  }

  // Entrenar modelo
  async trainModel({
    filePath,
    targetColumn,
    featureColumns,
    modelType = 'multivariate',
    modelName,
    neuralNetworkConfig
  }) {
    const response = await fetch(`${this.baseUrl}/train-model`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filePath,
        targetColumn,
        featureColumns,
        modelType,
        modelName,
        neuralNetworkConfig
      })
    });

    return await response.json();
  }

  // Realizar predicción
  async predict({
    modelId,
    inputData,
    includeWeather = false,
    location
  }) {
    const response = await fetch(`${this.baseUrl}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        modelId,
        inputData,
        includeWeather,
        location
      })
    });

    return await response.json();
  }

  // Obtener modelos disponibles
  async getModels() {
    const response = await fetch(`${this.baseUrl}/models`);
    return await response.json();
  }

  // Obtener clima actual
  async getCurrentWeather(location) {
    let url = `${this.baseUrl}/weather/current`;
    
    if (location.city) {
      url += `?city=${encodeURIComponent(location.city)}`;
    } else if (location.lat && location.lon) {
      url += `?lat=${location.lat}&lon=${location.lon}`;
    }

    const response = await fetch(url);
    return await response.json();
  }

  // Análisis completo
  async completeAnalysis({
    inputData,
    location,
    includeWeather = true
  }) {
    const response = await fetch(`${this.baseUrl}/analyze-complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inputData,
        location,
        includeWeather
      })
    });

    return await response.json();
  }

  // Health check
  async healthCheck() {
    const response = await fetch(`${this.baseUrl}/health`);
    return await response.json();
  }
}

// Ejemplos de uso
async function ejemploCompleto() {
  const aiClient = new AIClient();

  try {
    console.log('🔍 Verificando estado del microservicio...');
    const health = await aiClient.healthCheck();
    console.log('Estado:', health);

    console.log('\n🌤️ Obteniendo clima actual...');
    const weather = await aiClient.getCurrentWeather({ city: 'Huancavelica' });
    console.log('Clima actual:', weather);

    console.log('\n📊 Listando modelos disponibles...');
    const models = await aiClient.getModels();
    console.log('Modelos entrenados:', models.length);

    if (models.length > 0) {
      console.log('\n🔮 Realizando predicción con el primer modelo...');
      const prediction = await aiClient.predict({
        modelId: models[0].id,
        inputData: [25, 70, 15, 5], // temperatura, humedad, precipitación, viento
        includeWeather: true,
        location: { city: 'Lima' }
      });
      console.log('Predicción:', prediction);

      console.log('\n📈 Análisis completo...');
      const analysis = await aiClient.completeAnalysis({
        inputData: [22, 65, 10],
        location: { city: 'Huancavelica' },
        includeWeather: true
      });
      console.log('Análisis completo:', analysis);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

// Ejemplo de entrenamiento de modelo
async function ejemploEntrenamiento() {
  const aiClient = new AIClient();

  // Simular subida de archivo Excel
  console.log('📁 Para usar este ejemplo, primero sube un archivo Excel:');
  console.log('1. Prepara un archivo Excel con columnas como: fecha, temperatura, humedad, produccion');
  console.log('2. Sube el archivo usando uploadExcel()');
  console.log('3. Usa la ruta devuelta para entrenar el modelo');

  // Ejemplo de entrenamiento (después de subir archivo)
  const trainingExample = {
    filePath: './uploads/datos-agricolas.xlsx',
    targetColumn: 'produccion_kg',
    featureColumns: ['temperatura_promedio', 'humedad_promedio', 'precipitacion_total'],
    modelType: 'neural_network',
    modelName: 'predictor_produccion_papas',
    neuralNetworkConfig: {
      hiddenLayers: [64, 32, 16],
      epochs: 150
    }
  };

  console.log('\n🧠 Ejemplo de configuración de entrenamiento:');
  console.log(JSON.stringify(trainingExample, null, 2));

  // Para entrenar realmente, descomenta la siguiente línea:
  // const result = await aiClient.trainModel(trainingExample);
  // console.log('Resultado del entrenamiento:', result);
}

// Ejemplo específico para agricultura
async function ejemploAgricultura() {
  const aiClient = new AIClient();

  console.log('🌾 EJEMPLO AGRÍCOLA: Predicción de Rendimiento de Cultivos');
  console.log('='.repeat(60));

  // Datos típicos agrícolas
  const datosAgrícolas = {
    temperatura_promedio: 23.5,    // °C
    humedad_relativa: 65,          // %
    precipitacion_mes: 120,        // mm
    horas_sol_dia: 8.5,           // horas
    ph_suelo: 6.8,                // pH
    nutrientes_N: 45,             // kg/ha
    nutrientes_P: 25,             // kg/ha
    nutrientes_K: 35              // kg/ha
  };

  const inputVector = Object.values(datosAgrícolas);
  
  console.log('\n📊 Datos de entrada:');
  Object.entries(datosAgrícolas).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });

  try {
    // Análisis completo con datos meteorológicos
    const analysis = await aiClient.completeAnalysis({
      inputData: inputVector,
      location: { city: 'Huancavelica' },
      includeWeather: true
    });

    console.log('\n🎯 RESULTADOS DE LA PREDICCIÓN:');
    console.log('='.repeat(40));
    
    if (analysis.success) {
      console.log(`📈 Predicción promedio: ${analysis.averagePrediction?.toFixed(2)} kg/ha`);
      console.log(`🎯 Confianza promedio: ${(analysis.summary.averageConfidence * 100).toFixed(1)}%`);
      console.log(`🔢 Modelos consultados: ${analysis.summary.totalModels}`);
      console.log(`✅ Predicciones exitosas: ${analysis.summary.successfulPredictions}`);

      if (analysis.weatherData) {
        console.log('\n🌤️ DATOS METEOROLÓGICOS ACTUALES:');
        console.log(`  🌡️ Temperatura: ${analysis.weatherData.temperature}°C`);
        console.log(`  💧 Humedad: ${analysis.weatherData.humidity}%`);
        console.log(`  🌧️ Precipitación: ${analysis.weatherData.precipitation} mm`);
        console.log(`  💨 Viento: ${analysis.weatherData.windSpeed} m/s`);
      }

      console.log('\n📋 RECOMENDACIONES:');
      if (analysis.averagePrediction > 5000) {
        console.log('  ✅ Condiciones óptimas para la siembra');
        console.log('  🌱 Se espera un rendimiento alto');
      } else if (analysis.averagePrediction > 3000) {
        console.log('  ⚠️ Condiciones moderadas');
        console.log('  💡 Considerar optimizar nutrientes');
      } else {
        console.log('  🔴 Condiciones subóptimas');
        console.log('  🛠️ Revisar factores limitantes');
      }
    }
  } catch (error) {
    console.log('❌ Error en la predicción:', error.message);
    console.log('💡 Asegúrate de que el microservicio esté ejecutándose y tenga modelos entrenados');
  }
}

// Funciones de utilidad
function generarDatosEjemplo() {
  return {
    // Datos para 30 días de cultivo
    datos: Array.from({ length: 30 }, (_, i) => ({
      dia: i + 1,
      temperatura: 20 + Math.random() * 10,
      humedad: 50 + Math.random() * 30,
      precipitacion: Math.random() * 20,
      produccion: 3000 + Math.random() * 2000 // kg/ha
    }))
  };
}

// Exportar para uso en Node.js o navegador
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AIClient,
    ejemploCompleto,
    ejemploEntrenamiento,
    ejemploAgricultura,
    generarDatosEjemplo
  };
}

// Auto-ejecutar ejemplo si se ejecuta directamente
if (typeof window === 'undefined' && require.main === module) {
  console.log('🤖 MICROSERVICIO DE IA - EJEMPLOS DE USO');
  console.log('='.repeat(50));
  
  ejemploCompleto()
    .then(() => console.log('\n✅ Ejemplo básico completado'))
    .then(() => ejemploAgricultura())
    .then(() => console.log('\n🌾 Ejemplo agrícola completado'))
    .catch(console.error);
}
