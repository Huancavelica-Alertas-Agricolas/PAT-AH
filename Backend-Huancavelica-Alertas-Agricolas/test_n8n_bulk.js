const fetch = require('node-fetch').default || require('node-fetch');

const n8nWebhookUrl = 'https://climatrack0.app.n8n.cloud/webhook/webhook/clima-alerta';

const scenarios = [
  {
    descripcion: 'Temperatura crítica detectada — probando flujo',
    tipo: 'temperatura',
    severidad: 'alta',
    zona: 'Huancavelica',
    ubicacion: 'Estación meteorológica central',
    recipients: [
      { id: 'usuario-aldai', nombre: 'Aldai', telefono: '+51904031408', preferredChannel: 'sms' }
    ],
  },
  {
    descripcion: 'Lluvias intensas previstas — probando flujo',
    tipo: 'lluvia',
    severidad: 'media',
    zona: 'Huancavelica',
    ubicacion: 'Cuenca del río',
    recipients: [
      { id: 'usuario-aldai', nombre: 'Aldai', telefono: '+51904031408', preferredChannel: 'sms' }
    ],
  },
  {
    descripcion: 'Riesgo de helada esta noche — probando flujo',
    tipo: 'helada',
    severidad: 'alta',
    zona: 'Huancavelica',
    ubicacion: 'Valles altos',
    recipients: [
      { id: 'usuario-aldai', nombre: 'Aldai', telefono: '+51904031408', preferredChannel: 'sms' }
    ],
  },
];

async function runTests() {
  for (const s of scenarios) {
    console.log('\n--- Enviando escenario:', s.tipo, s.severidad, '---');
    try {
      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(s),
      });
      const text = await response.text();
      console.log('HTTP', response.status, '-', text);
    } catch (err) {
      console.error('Error enviando escenario', s.tipo, err.message);
    }
  }
  console.log('\nTodas las pruebas enviadas.');
}

runTests();
