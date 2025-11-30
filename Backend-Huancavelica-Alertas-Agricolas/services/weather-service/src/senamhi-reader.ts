import * as XLSX from 'xlsx';
import { join } from 'path';

export interface SenamhiRecord {
  fecha?: string;
  temp_min?: number;
  temp_max?: number;
  precipitacion?: number;
  humedad?: number;
  viento?: number;
  evento_extremo?: string;
}

export function leerSenamhiExcel(): SenamhiRecord[] {
  try {
    const filePath = join(process.cwd(), 'data', 'DATOS SENAMHI.xlsx');
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData: any[] = XLSX.utils.sheet_to_json(sheet, { defval: null });
    
    // Mapear los datos del formato actual al formato esperado
    const data = rawData.map((row: any) => ({
      fecha: row['Fecha'] || row['FECHA'] || row['fecha'],
      temp_min: parseFloat(row['Temp Min'] || row['TEMP_MIN'] || row['temp_min']) || null,
      temp_max: parseFloat(row['Temp Max'] || row['TEMP_MAX'] || row['temp_max']) || null,
      precipitacion: parseFloat(row['Precipitación'] || row['PRECIPITACION'] || row['precipitacion']) || null,
      humedad: parseFloat(row['Humedad'] || row['HUMEDAD'] || row['humedad']) || null,
      viento: parseFloat(row['Viento'] || row['VIENTO'] || row['viento']) || null,
      evento_extremo: row['Evento Extremo'] || row['EVENTO_EXTREMO'] || row['evento_extremo'] || null,
    }));
    
    return data.filter(record => record.fecha); // Filtrar registros sin fecha
  } catch (error) {
    console.error('Error al leer archivo SENAMHI:', error);
    return [];
  }
}
