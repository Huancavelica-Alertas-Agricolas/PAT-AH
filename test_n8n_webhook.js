const fetch = require('node-fetch');

async function testN8nWebhook() {
  const n8nWebhookUrl = 'https://climatrack0.app.n8n.cloud/webhook/webhook/clima-alerta';

  const payload = {
    descripcion: 'Prueba de alerta desde backend',
    tipo: 'temperatura',
    severidad: 'alta',
    zona: 'Huancavelica',
    ubicacion: 'Centro de la ciudad',
    recipients: [
      {
        id: 'test-user-1',
        nombre: 'Usuario de Prueba',
        email: 'test@example.com',
        telefono: '+51987654321',
        preferredChannel: 'email'
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