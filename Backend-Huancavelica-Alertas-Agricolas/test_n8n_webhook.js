const fetch = require('node-fetch').default || require('node-fetch');

async function testN8nWebhook() {
  const n8nWebhookUrl = 'https://climatrack0.app.n8n.cloud/webhook/webhook/clima-alerta';

  const payload = {
    descripcion: 'Alerta de prueba — por favor ignorar',
    tipo: 'incendio',
    severidad: 'alta',
    zona: 'Huancavelica',
    ubicacion: 'Bosque cercano al pueblo',
    latitud: null,
    longitud: null,
    recipients: [
      {
        id: 'usuario-aldai',
        nombre: 'Aldai',
        email: null,
        telefono: '+51904031408',
        preferredChannel: 'sms'
      }
    ],
  };

  try {
    console.log('Enviando payload de prueba:', JSON.stringify(payload, null, 2));

    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('Status de respuesta:', response.status);
    const responseText = await response.text();
    console.log('Respuesta del webhook:', responseText);

  } catch (error) {
    console.error('Error en la prueba:', error);
  }
}

testN8nWebhook();