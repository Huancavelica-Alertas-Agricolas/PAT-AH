import { leerSenamhiExcel, SenamhiRecord } from './senamhi-reader';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { ClientProxy } from '@nestjs/microservices';

export interface AlertaClimatica {
  fecha?: string;
  tipo: string;
  descripcion: string;
}

@Injectable()
export class RiesgoClimaService {
  private readonly logger = new Logger(RiesgoClimaService.name);

  constructor(
    private readonly weatherService: WeatherService,
    @Inject('ALERT_SERVICE') private alertService: ClientProxy,
  ) {}

  async generarAlertas(): Promise<AlertaClimatica[]> {
    const historico = leerSenamhiExcel();
    const pronosticoResp = await this.weatherService.getCurrentWeatherData();
    const pronostico = pronosticoResp.data || [];
    const alertas: AlertaClimatica[] = [];

    for (const registro of pronostico) {
      if (registro.temp_c < 0) {
        const alerta: AlertaClimatica = {
          fecha: registro.fecha_hora,
          tipo: 'helada',
          descripcion: 'Riesgo de helada en Huancavelica',
        };
        alertas.push(alerta);
        await this.enviarEventoAlerta(alerta);
      }
      if (registro.precip_mm > 20) {
        const alerta: AlertaClimatica = {
          fecha: registro.fecha_hora,
          tipo: 'lluvia',
          descripcion: 'Lluvia intensa posible',
        };
        alertas.push(alerta);
        await this.enviarEventoAlerta(alerta);
      }
      if (registro.temp_c >= 0 && registro.temp_c <= 5 && registro.humedad > 80 && registro.clima.includes('nublado')) {
        const alerta: AlertaClimatica = {
          fecha: registro.fecha_hora,
          tipo: 'granizada',
          descripcion: 'Riesgo de granizada',
        };
        alertas.push(alerta);
        await this.enviarEventoAlerta(alerta);
      }
    }
    return alertas;
  }

  private async enviarEventoAlerta(alerta: AlertaClimatica) {
    try {
      await this.alertService.emit('generate_weather_alert', {
        tipo: alerta.tipo,
        fecha: alerta.fecha,
        descripcion: alerta.descripcion,
      });
      this.logger.log(`Evento de alerta enviado al alert-service: ${JSON.stringify(alerta)}`);
    } catch (error) {
      this.logger.error('Error enviando evento al alert-service', (error as Error).message);
    }
  }
}
