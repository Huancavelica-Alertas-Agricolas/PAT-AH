import { Injectable, BadRequestException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { ExcelDataDto, TrainingDataDto } from '../dto/excel-data.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ExcelProcessorService {
  private readonly uploadsDir = path.join(process.cwd(), 'uploads');

  constructor() {
    // Asegurar que el directorio de uploads existe
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  /**
   * Procesa un archivo Excel y extrae los datos
   */
  async processExcelFile(filePath: string): Promise<ExcelDataDto> {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convertir a JSON con headers en la primera fila
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length === 0) {
        throw new BadRequestException('El archivo Excel está vacío');
      }

      const headers = jsonData[0] as string[];
      const data = jsonData.slice(1);
      
      // Limpiar datos nulos o undefined
      const cleanData = data
        .filter(row => row && (row as any[]).some(cell => cell !== null && cell !== undefined))
        .map(row => {
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = (row as any[])[index] || null;
          });
          return obj;
        });

      const result: ExcelDataDto = {
        fileName: path.basename(filePath),
        columns: headers,
        data: cleanData,
        rowCount: cleanData.length,
        uploadDate: new Date()
      };

      return result;
    } catch (error) {
      throw new BadRequestException(`Error procesando archivo Excel: ${error.message}`);
    }
  }

  /**
   * Valida y prepara los datos para entrenamiento
   */
  async prepareTrainingData(
    excelData: ExcelDataDto, 
    targetColumn: string, 
    featureColumns: string[]
  ): Promise<TrainingDataDto> {
    try {
      // Validar que las columnas existen
      const missingColumns = [...featureColumns, targetColumn].filter(
        col => !excelData.columns.includes(col)
      );

      if (missingColumns.length > 0) {
        throw new BadRequestException(`Columnas no encontradas: ${missingColumns.join(', ')}`);
      }

      // Extraer y limpiar datos
      const features: number[][] = [];
      const targets: number[] = [];

      excelData.data.forEach(row => {
        const featureValues = featureColumns.map(col => {
          const value = row[col];
          return this.convertToNumber(value);
        });

        const targetValue = this.convertToNumber(row[targetColumn]);

        // Solo incluir filas con datos válidos
        if (
          featureValues.every(val => !isNaN(val)) && 
          !isNaN(targetValue)
        ) {
          features.push(featureValues);
          targets.push(targetValue);
        }
      });

      if (features.length === 0) {
        throw new BadRequestException('No se encontraron datos numéricos válidos para entrenamiento');
      }

      return {
        features,
        targets,
        featureNames: featureColumns,
        targetName: targetColumn
      };
    } catch (error) {
      throw new BadRequestException(`Error preparando datos de entrenamiento: ${error.message}`);
    }
  }

  /**
   * Convierte un valor a número, manejando diferentes formatos
   */
  private convertToNumber(value: any): number {
    if (typeof value === 'number') {
      return value;
    }
    
    if (typeof value === 'string') {
      // Remover comas, espacios y otros caracteres
      const cleaned = value.replace(/[,\s]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? NaN : parsed;
    }

    return NaN;
  }

  /**
   * Obtiene estadísticas básicas de los datos
   */
  async getDataStatistics(excelData: ExcelDataDto): Promise<any> {
    const statistics: any = {};

    excelData.columns.forEach(column => {
      const values = excelData.data
        .map(row => this.convertToNumber(row[column]))
        .filter(val => !isNaN(val));

      if (values.length > 0) {
        statistics[column] = {
          count: values.length,
          mean: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          std: this.calculateStandardDeviation(values)
        };
      }
    });

    return {
      totalRows: excelData.rowCount,
      totalColumns: excelData.columns.length,
      columnStatistics: statistics,
      missingDataPercentage: this.calculateMissingDataPercentage(excelData)
    };
  }

  private calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private calculateMissingDataPercentage(excelData: ExcelDataDto): any {
    const missing: any = {};

    excelData.columns.forEach(column => {
      const nullCount = excelData.data.filter(row => 
        row[column] === null || 
        row[column] === undefined || 
        row[column] === ''
      ).length;

      missing[column] = (nullCount / excelData.rowCount) * 100;
    });

    return missing;
  }

  /**
   * Valida la calidad de los datos para machine learning
   */
  async validateDataQuality(excelData: ExcelDataDto): Promise<{
    isValid: boolean;
    warnings: string[];
    recommendations: string[];
  }> {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Verificar tamaño mínimo del dataset
    if (excelData.rowCount < 50) {
      warnings.push('Dataset muy pequeño (< 50 filas). Se recomiendan al menos 100 filas para un buen entrenamiento.');
    }

    // Verificar datos faltantes
    const missingData = this.calculateMissingDataPercentage(excelData);
    Object.entries(missingData).forEach(([column, percentage]) => {
      if ((percentage as number) > 30) {
        warnings.push(`Columna "${column}" tiene ${percentage.toFixed(1)}% de datos faltantes.`);
        recommendations.push(`Considerar eliminar la columna "${column}" o imputar los valores faltantes.`);
      }
    });

    // Verificar variabilidad de los datos
    const stats = await this.getDataStatistics(excelData);
    Object.entries(stats.columnStatistics).forEach(([column, stat]: [string, any]) => {
      if (stat.std === 0) {
        warnings.push(`Columna "${column}" tiene varianza cero (todos los valores son iguales).`);
        recommendations.push(`Considerar eliminar la columna "${column}" ya que no aporta información.`);
      }
    });

    return {
      isValid: warnings.length < 5, // Criterio simple: máximo 5 warnings
      warnings,
      recommendations
    };
  }
}
