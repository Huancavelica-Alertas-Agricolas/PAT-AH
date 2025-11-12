import { Injectable, Logger } from '@nestjs/common';
import { 
  TrainingDataDto, 
  ModelInfoDto, 
  PredictionResultDto, 
  TrainingResultDto,
  WeatherDataDto 
} from '../dto/excel-data.dto';
import * as fs from 'fs';
import * as path from 'path';

// Implementación simple de regresión lineal sin dependencias externas
class SimpleRegression {
  public slope: number;
  public intercept: number;
  public r2: number;

  constructor(x: number[], y: number[]) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    this.slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    this.intercept = (sumY - this.slope * sumX) / n;

    // Calcular R²
    const yMean = sumY / n;
    const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - this.predict(x[i]), 2), 0);
    const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    this.r2 = 1 - (ssRes / ssTot);
  }

  predict(x: number): number {
    return this.slope * x + this.intercept;
  }
}

// Implementación simple de regresión múltiple
class MultipleRegression {
  public coefficients: number[];
  public r2: number;

  constructor(X: number[][], y: number[]) {
    // Implementación básica usando mínimos cuadrados
    const n = X.length;
    const m = X[0].length;
    
    // Agregar columna de unos para el intercepto
    const XWithIntercept = X.map(row => [...row, 1]);
    
    // Calcular coeficientes usando aproximación numérica
    this.coefficients = this.solveLinearSystem(XWithIntercept, y);
    
    // Calcular R²
    const yMean = y.reduce((a, b) => a + b, 0) / n;
    const predictions = X.map(row => this.predict(row));
    const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - predictions[i], 2), 0);
    const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    this.r2 = 1 - (ssRes / ssTot);
  }

  predict(x: number[]): number {
    return x.reduce((sum, val, i) => sum + val * this.coefficients[i], 0) + 
           this.coefficients[this.coefficients.length - 1];
  }

  private solveLinearSystem(X: number[][], y: number[]): number[] {
    // Implementación simplificada usando eliminación gaussiana
    const n = X.length;
    const m = X[0].length;
    
    // Crear matriz aumentada
    const augmented = X.map((row, i) => [...row, y[i]]);
    
    // Eliminación hacia adelante
    for (let i = 0; i < Math.min(n, m); i++) {
      // Encontrar pivot
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = k;
        }
      }
      
      // Intercambiar filas
      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
      
      // Eliminar
      for (let k = i + 1; k < n; k++) {
        if (augmented[i][i] !== 0) {
          const factor = augmented[k][i] / augmented[i][i];
          for (let j = i; j <= m; j++) {
            augmented[k][j] -= factor * augmented[i][j];
          }
        }
      }
    }
    
    // Sustitución hacia atrás
    const solution = new Array(m).fill(0);
    for (let i = Math.min(n, m) - 1; i >= 0; i--) {
      solution[i] = augmented[i][m];
      for (let j = i + 1; j < m; j++) {
        solution[i] -= augmented[i][j] * solution[j];
      }
      if (augmented[i][i] !== 0) {
        solution[i] /= augmented[i][i];
      }
    }
    
    return solution;
  }
}

interface StoredModel {
  id: string;
  name: string;
  type: 'linear' | 'multivariate';
  features: string[];
  target: string;
  model: any;
  metadata: {
    accuracy: number;
    createdAt: Date;
    lastTrained: Date;
    trainingMetrics: any;
  };
}

@Injectable()
export class MachineLearningServiceSimple {
  private readonly logger = new Logger(MachineLearningServiceSimple.name);
  private readonly modelsDir = path.join(process.cwd(), 'trained-models');
  private models = new Map<string, StoredModel>();

  constructor() {
    // Asegurar que el directorio de modelos existe
    if (!fs.existsSync(this.modelsDir)) {
      fs.mkdirSync(this.modelsDir, { recursive: true });
    }
    this.loadStoredModels();
  }

  /**
   * Entrena un modelo de regresión lineal simple
   */
  async trainLinearModel(
    data: TrainingDataDto,
    modelName: string = 'linear_model'
  ): Promise<TrainingResultDto> {
    const startTime = Date.now();
    
    try {
      if (data.features[0].length !== 1) {
        throw new Error('Regresión lineal simple requiere exactamente una característica');
      }

      const X = data.features.map(feature => feature[0]);
      const Y = data.targets;

      const model = new SimpleRegression(X, Y);
      
      // Calcular métricas
      const predictions = X.map(x => model.predict(x));
      const metrics = this.calculateMetrics(Y, predictions);
      
      // Guardar modelo
      const modelId = this.generateModelId();
      const storedModel: StoredModel = {
        id: modelId,
        name: modelName,
        type: 'linear',
        features: data.featureNames,
        target: data.targetName,
        model: {
          slope: model.slope,
          intercept: model.intercept,
          r2: model.r2
        },
        metadata: {
          accuracy: model.r2,
          createdAt: new Date(),
          lastTrained: new Date(),
          trainingMetrics: metrics
        }
      };

      this.models.set(modelId, storedModel);
      await this.saveModel(storedModel);

      return {
        success: true,
        modelId,
        accuracy: model.r2,
        trainingTime: Date.now() - startTime,
        metrics
      };
    } catch (error) {
      this.logger.error(`Error entrenando modelo lineal: ${error.message}`);
      return {
        success: false,
        modelId: '',
        accuracy: 0,
        trainingTime: Date.now() - startTime,
        error: error.message,
        metrics: {}
      };
    }
  }

  /**
   * Entrena un modelo de regresión multivariante
   */
  async trainMultivariateModel(
    data: TrainingDataDto,
    modelName: string = 'multivariate_model'
  ): Promise<TrainingResultDto> {
    const startTime = Date.now();
    
    try {
      const model = new MultipleRegression(data.features, data.targets);
      
      // Calcular predicciones y métricas
      const predictions = data.features.map(feature => model.predict(feature));
      const metrics = this.calculateMetrics(data.targets, predictions);
      
      // Guardar modelo
      const modelId = this.generateModelId();
      const storedModel: StoredModel = {
        id: modelId,
        name: modelName,
        type: 'multivariate',
        features: data.featureNames,
        target: data.targetName,
        model: {
          coefficients: model.coefficients,
          r2: model.r2
        },
        metadata: {
          accuracy: model.r2,
          createdAt: new Date(),
          lastTrained: new Date(),
          trainingMetrics: metrics
        }
      };

      this.models.set(modelId, storedModel);
      await this.saveModel(storedModel);

      return {
        success: true,
        modelId,
        accuracy: model.r2,
        trainingTime: Date.now() - startTime,
        metrics
      };
    } catch (error) {
      this.logger.error(`Error entrenando modelo multivariante: ${error.message}`);
      return {
        success: false,
        modelId: '',
        accuracy: 0,
        trainingTime: Date.now() - startTime,
        error: error.message,
        metrics: {}
      };
    }
  }

  /**
   * Realiza predicciones con un modelo entrenado
   */
  async predict(
    modelId: string,
    inputData: number[],
    weatherData?: WeatherDataDto
  ): Promise<PredictionResultDto> {
    try {
      const storedModel = this.models.get(modelId);
      if (!storedModel) {
        throw new Error(`Modelo ${modelId} no encontrado`);
      }

      let prediction: number;
      let confidence = storedModel.metadata.accuracy;

      // Combinar datos de entrada con datos meteorológicos si están disponibles
      let finalInputData = inputData;
      if (weatherData && storedModel.features.some(f => f.includes('weather') || f.includes('clima'))) {
        const weatherFeatures = [
          weatherData.temperature,
          weatherData.humidity,
          weatherData.precipitation,
          weatherData.windSpeed
        ];
        finalInputData = [...inputData, ...weatherFeatures];
      }

      switch (storedModel.type) {
        case 'linear':
          if (finalInputData.length !== 1) {
            throw new Error('Modelo lineal requiere exactamente una característica');
          }
          prediction = storedModel.model.slope * finalInputData[0] + storedModel.model.intercept;
          break;

        case 'multivariate':
          const coefficients = storedModel.model.coefficients;
          prediction = finalInputData.reduce((sum, val, index) => {
            return sum + (val * (coefficients[index] || 0));
          }, coefficients[coefficients.length - 1] || 0);
          break;

        default:
          throw new Error(`Tipo de modelo no soportado: ${storedModel.type}`);
      }

      return {
        prediction,
        confidence,
        modelUsed: modelId,
        inputData: finalInputData,
        timestamp: new Date(),
        weatherInfluence: weatherData ? 0.3 : undefined
      };
    } catch (error) {
      this.logger.error(`Error realizando predicción: ${error.message}`);
      throw new Error(`Error en predicción: ${error.message}`);
    }
  }

  /**
   * Obtiene información de todos los modelos disponibles
   */
  getModelsInfo(): ModelInfoDto[] {
    return Array.from(this.models.values()).map(model => ({
      id: model.id,
      name: model.name,
      type: model.type as any,
      accuracy: model.metadata.accuracy,
      createdAt: model.metadata.createdAt,
      lastTrained: model.metadata.lastTrained,
      features: model.features,
      target: model.target,
      isActive: true
    }));
  }

  /**
   * Elimina un modelo
   */
  async deleteModel(modelId: string): Promise<boolean> {
    try {
      const model = this.models.get(modelId);
      if (!model) {
        return false;
      }

      // Eliminar archivo de metadatos
      const metadataPath = path.join(this.modelsDir, `${modelId}.json`);
      if (fs.existsSync(metadataPath)) {
        fs.unlinkSync(metadataPath);
      }

      this.models.delete(modelId);
      return true;
    } catch (error) {
      this.logger.error(`Error eliminando modelo ${modelId}: ${error.message}`);
      return false;
    }
  }

  // Métodos privados auxiliares

  private generateModelId(): string {
    return `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateMetrics(actual: number[], predicted: number[]): any {
    const n = actual.length;
    
    // MSE
    const mse = actual.reduce((sum, val, i) => {
      return sum + Math.pow(val - predicted[i], 2);
    }, 0) / n;

    // RMSE
    const rmse = Math.sqrt(mse);

    // R²
    const actualMean = actual.reduce((a, b) => a + b, 0) / n;
    const totalSumSquares = actual.reduce((sum, val) => {
      return sum + Math.pow(val - actualMean, 2);
    }, 0);
    const residualSumSquares = actual.reduce((sum, val, i) => {
      return sum + Math.pow(val - predicted[i], 2);
    }, 0);
    const r2 = 1 - (residualSumSquares / totalSumSquares);

    return { mse, rmse, r2 };
  }

  private async saveModel(model: StoredModel): Promise<void> {
    const filePath = path.join(this.modelsDir, `${model.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(model, null, 2));
  }

  private loadStoredModels(): void {
    try {
      const files = fs.readdirSync(this.modelsDir);
      const jsonFiles = files.filter(file => file.endsWith('.json'));

      for (const file of jsonFiles) {
        try {
          const filePath = path.join(this.modelsDir, file);
          const modelData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          this.models.set(modelData.id, modelData);
        } catch (error) {
          this.logger.warn(`Error cargando modelo desde ${file}: ${error.message}`);
        }
      }

      this.logger.log(`Cargados ${this.models.size} modelos desde disco`);
    } catch (error) {
      this.logger.warn(`Error cargando modelos: ${error.message}`);
    }
  }
}
