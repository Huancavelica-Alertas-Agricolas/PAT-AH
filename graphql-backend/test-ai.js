// Test básico del microservicio de IA
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testAIService() {
  console.log('🔍 Probando microservicio de IA...\n');

  try {
    // Test 1: Health Check
    console.log('1. Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/ai/health`);
    console.log('   ✅ Estado:', healthResponse.data.status);
    console.log('   📊 Servicios:', healthResponse.data.services);
    console.log('   📈 Modelos:', healthResponse.data.modelsCount);

    // Test 2: Clima
    console.log('\n2. Test del clima...');
    try {
      const weatherResponse = await axios.get(`${BASE_URL}/ai/weather/current?city=Lima`);
      console.log('   ✅ Clima obtenido:', weatherResponse.data.location);
      console.log('   🌡️ Temperatura:', weatherResponse.data.temperature, '°C');
    } catch (weatherError) {
      console.log('   ⚠️ Clima no disponible (configurar OPENWEATHER_API_KEY)');
    }

    // Test 3: Lista de modelos
    console.log('\n3. Lista de modelos...');
    const modelsResponse = await axios.get(`${BASE_URL}/ai/models`);
    console.log('   📊 Modelos disponibles:', modelsResponse.data.length);

    console.log('\n🎉 ¡Microservicio de IA funcionando correctamente!');
    console.log('\n📚 Para usar completamente:');
    console.log('   1. Configurar OPENWEATHER_API_KEY en .env');
    console.log('   2. Subir archivo Excel con /ai/upload-excel');
    console.log('   3. Entrenar modelos con /ai/train-model');
    console.log('   4. Hacer predicciones con /ai/predict');

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Error: El servidor no está ejecutándose');
      console.log('💡 Ejecuta: npm run start:dev');
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

// Solo ejecutar si es llamado directamente
if (require.main === module) {
  testAIService();
}

module.exports = { testAIService };
