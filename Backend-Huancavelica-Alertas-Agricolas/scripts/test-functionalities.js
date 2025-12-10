const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = 'http://localhost:3003/api';

// Credenciales de prueba del seed
const testUsers = [
  { phone: '+51999000001', password: 'password123', role: 'Admin' },
  { phone: '+51999000004', password: 'password123', role: 'Usuario 1' },
  { phone: '+51999000005', password: 'password123', role: 'Usuario 2' }
];

async function testLogin(user) {
  console.log(`\n🔐 Probando login para ${user.role}...`);
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        telefono: user.phone,
        password: user.password
      })
    });

    const data = await response.json();
    if (response.ok) {
      console.log(`✅ Login exitoso para ${user.role}`);
      return data.token;
    } else {
      console.log(`❌ Login falló para ${user.role}:`, data.message);
      return null;
    }
  } catch (error) {
    console.log(`❌ Error en login para ${user.role}:`, error.message);
    return null;
  }
}

async function testForgotPassword(phone) {
  console.log(`\n🔑 Probando "olvidé contraseña" para ${phone}...`);
  try {
    const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telefono: phone })
    });

    const data = await response.json();
    if (response.ok) {
      console.log(`✅ Código enviado exitosamente para ${phone}`);
      return true;
    } else {
      console.log(`❌ Error enviando código para ${phone}:`, data.message);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error en forgot password para ${phone}:`, error.message);
    return false;
  }
}

async function testWeatherEndpoint(token) {
  console.log(`\n🌤️ Probando endpoint de clima...`);
  try {
    const response = await fetch(`${BASE_URL}/weather`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (response.ok) {
      console.log(`✅ Datos climáticos obtenidos: ${data.length} registros`);
      return true;
    } else {
      console.log(`❌ Error obteniendo clima:`, data.message);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error en weather endpoint:`, error.message);
    return false;
  }
}

async function testUsersEndpoint(token) {
  console.log(`\n👥 Probando endpoint de usuarios...`);
  try {
    const response = await fetch(`${BASE_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (response.ok) {
      console.log(`✅ Usuarios obtenidos: ${data.length} usuarios`);
      return true;
    } else {
      console.log(`❌ Error obteniendo usuarios:`, data.message);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error en users endpoint:`, error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Iniciando pruebas de funcionalidades...\n');

  // Probar login con diferentes usuarios
  for (const user of testUsers) {
    const token = await testLogin(user);
    if (token) {
      // Probar endpoints con el token obtenido
      await testWeatherEndpoint(token);
      await testUsersEndpoint(token);
      break; // Solo probar con el primer usuario que funcione
    }
  }

  // Probar forgot password
  await testForgotPassword('+51999000001');

  console.log('\n✨ Pruebas completadas!');
}

runTests().catch(console.error);