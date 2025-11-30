const TipoCanal = {
  TELEGRAM: 'telegram',
  GMAIL: 'gmail',
  SMS: 'sms'
};

const EstadoEnvio = {
  PENDIENTE: 'pendiente',
  ENVIADO: 'enviado',
  FALLIDO: 'fallido',
  ENTREGADO: 'entregado'
};

class AlertCanal {
  constructor() {
    this.id = undefined;
    this.alertId = undefined;
    this.channel = undefined;
    this.recipient = undefined;
    this.status = EstadoEnvio.PENDIENTE;
    this.sentAt = undefined;
    this.errorMessage = undefined;
    this.metadata = undefined;
    this.alert = undefined;
    this.createdAt = undefined;
  }
}

module.exports = { AlertCanal, TipoCanal, EstadoEnvio };
