import { Injectable, Logger } from '@nestjs/common';
import { 
  TrainingDataDto, 
  ModelInfoDto, 
  PredictionResultDto, 
  TrainingResultDto,
  WeatherDataDto 
} from '../dto/excel-data.dto';
import * as tf from '@tensorflow/tfjs-node';
import { Matrix } from 'ml-matrix';
import * as fs from 'fs';
import * as path from 'path';

// Implementación simple de regresión lineal
class SimpleLinearRegression {
  public slope: number;
  public intercept: number;

  constructor(x: number[], y: number[]) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    this.slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    this.intercept = (sumY - this.slope * sumX) / n;
  }

  predict(x: number): number {
    return this.slope * x + this.intercept;
  }

  toString(): string {
    return `y = ${this.slope.toFixed(4)}x + ${this.intercept.toFixed(4)}`;
  }
}

// Implementación simple de regresión multivariante
class MultivariateLinearRegression {
  public weights: number[];

  constructor(X: Matrix, y: number[]) {
    // Agregar columna de unos para el intercepto
    const XMatrix = new Matrix(X.to2DArray().map(row => [...row, 1]));
    const yMatrix = new Matrix([y]).transpose();
    
    // Calcular pesos usando ecuaciones normales: w = (X^T * X)^-1 * X^T * y
    const XT = XMatrix.transpose();
    const XTX = XT.mmul(XMatrix);
    const XTXInv = XTX.inverse();
    const XTy = XT.mmul(yMatrix);
    const weights = XTXInv.mmul(XTy);
    
    this.weights = weights.to1DArray();
  }

  predict(x: number[]): number {
    return x.reduce((sum, val, i) => sum + val * this.weights[i], 0) + this.weights[this.weights.length - 1];
  }
}

interface StoredModel {
  id: string;
  name: string;
  type: 'linear' | 'multivariate' | 'neural_network';
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
export class MachineLearningService {
  private readonly logger = new Logger(MachineLearningService.name);
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

      // Extraer X e Y
      const X = data.features.map(feature => feature[0]);
      const Y = data.targets;

      // Crear y entrenar modelo
      const model = new SimpleLinearRegression(X, Y);
      
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
          equation: model.toString()
        },
        metadata: {
          accuracy: metrics.r2,
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
        accuracy: metrics.r2,
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
      // Crear matrices
      const X = new Matrix(data.features);
      const Y = data.targets;

      // Crear y entrenar modelo
      const model = new MultivariateLinearRegression(X, Y);
      
      // Calcular predicciones y métricas
      const predictions = data.features.map(feature => model.predict(feature));
      const metrics = this.calculateMetrics(Y, predictions);
      
      // Guardar modelo
      const modelId = this.generateModelId();
      const storedModel: StoredModel = {
        id: modelId,
        name: modelName,
        type: 'multivariate',
        features: data.featureNames,
        target: data.targetName,
        model: {
          coefficients: model.weights,
          equation: this.buildEquation(data.featureNames, model.weights)
        },
        metadata: {
          accuracy: metrics.r2,
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
        accuracy: metrics.r2,
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
   * Entrena una red neuronal con TensorFlow.js
   */
  async trainNeuralNetworkModel(
    data: TrainingDataDto,
    modelName: string = 'neural_network_model',
    hiddenLayers: number[] = [64, 32]
  ): Promise<TrainingResultDto> {
    const startTime = Date.now();
    
    try {
      // Normalizar datos
      const normalizedData = this.normalizeData(data);
      
      // Crear tensores
      const xs = tf.tensor2d(normalizedData.features);
      const ys = tf.tensor2d(normalizedData.targets, [normalizedData.targets.length, 1]);

      // Crear modelo
      const model = tf.sequential();
      
      // Capa de entrada
      model.add(tf.layers.dense({
        inputShape: [data.features[0].length],
        units: hiddenLayers[0],
        activation: 'relu'
      }));

      // Capas ocultas
      for (let i = 1; i < hiddenLayers.length; i++) {
        model.add(tf.layers.dense({
          units: hiddenLayers[i],
          activation: 'relu'
        }));
        model.add(tf.layers.dropout({ rate: 0.2 }));
      }

      // Capa de salida
      model.add(tf.layers.dense({ units: 1, activation: 'linear' }));

      // Compilar modelo
      model.compile({
        optimizer: tf.train.adam(0.01),
        loss: 'meanSquaredError',
        metrics: ['mse']
      });

      // Entrenar modelo
      const history = await model.fit(xs, ys, {
        epochs: 100,
        batchSize: 32,
        validationSplit: 0.2,
        verbose: 0
      });

      // Calcular métricas en el conjunto de entrenamiento
      const predictions = await model.predict(xs) as tf.Tensor;
      const predictionValues = await predictions.data();
      const metrics = this.calculateMetrics(
        normalizedData.targets, 
        Array.from(predictionValues)
      );

      // Guardar modelo
      const modelId = this.generateModelId();
      const modelPath = path.join(this.modelsDir, `${modelId}_model`);
      await model.save(`file://${modelPath}`);

      const storedModel: StoredModel = {
        id: modelId,
        name: modelName,
        type: 'neural_network',
        features: data.featureNames,
        target: data.targetName,
        model: {
          path: modelPath,
          architecture: hiddenLayers,
          normalization: normalizedData.normalizationParams
        },
        metadata: {
          accuracy: metrics.r2,
          createdAt: new Date(),
          lastTrained: new Date(),
          trainingMetrics: {
            ...metrics,
            finalLoss: history.history.loss[history.history.loss.length - 1],
            epochs: 100
          }
        }
      };

      this.models.set(modelId, storedModel);
      await this.saveModel(storedModel);

      // Limpiar memoria
      xs.dispose();
      ys.dispose();
      predictions.dispose();

      return {
        success: true,
        modelId,
        accuracy: metrics.r2,
        trainingTime: Date.now() - startTime,
        metrics: storedModel.metadata.trainingMetrics
      };
    } catch (error) {
      this.logger.error(`Error entrenando red neuronal: ${error.message}`);
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
      let confidence = 0.8; // Valor por defecto

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
          confidence = storedModel.metadata.accuracy;
          break;

        case 'multivariate':
          const coefficients = storedModel.model.coefficients;
          prediction = coefficients.reduce((sum: number, coef: number, index: number) => {
            return sum + (coef * (finalInputData[index] || 0));
          }, coefficients[coefficients.length - 1]); // Último coeficiente es el intercepto
          confidence = storedModel.metadata.accuracy;
          break;

        case 'neural_network':
          const model = await tf.loadLayersModel(`file://${storedModel.model.path}/model.json`);
          
          // Normalizar entrada usando los parámetros guardados
          const normalizedInput = this.normalizeInput(
            finalInputData, 
            storedModel.model.normalization
          );
          
          const inputTensor = tf.tensor2d([normalizedInput]);
          const predictionTensor = model.predict(inputTensor) as tf.Tensor;
          const predictionArray = await predictionTensor.data();
          
          // Desnormalizar predicción
          prediction = this.denormalizePrediction(
            predictionArray[0], 
            storedModel.model.normalization
          );
          
          confidence = storedModel.metadata.accuracy;
          
          // Limpiar memoria
          inputTensor.dispose();
          predictionTensor.dispose();
          model.dispose();
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
        weatherInfluence: weatherData ? 0.3 : undefined // Indicador de influencia del clima
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
      type: model.type,
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

      // Eliminar archivos si es una red neuronal
      if (model.type === 'neural_network' && model.model.path) {
        const modelPath = model.model.path;
        if (fs.existsSync(modelPath)) {
          fs.rmSync(modelPath, { recursive: true, force: true });
        }
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

  private normalizeData(data: TrainingDataDto): {
    features: number[][];
    targets: number[];
    normalizationParams: any;
  } {
    // Calcular estadísticas para normalización
    const featureMeans: number[] = [];
    const featureStds: number[] = [];
    
    for (let i = 0; i < data.features[0].length; i++) {
      const column = data.features.map(row => row[i]);
      const mean = column.reduce((a, b) => a + b, 0) / column.length;
      const std = Math.sqrt(column.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / column.length);
      
      featureMeans.push(mean);
      featureStds.push(std || 1); // Evitar división por cero
    }

    const targetMean = data.targets.reduce((a, b) => a + b, 0) / data.targets.length;
    const targetStd = Math.sqrt(data.targets.reduce((sum, val) => sum + Math.pow(val - targetMean, 2), 0) / data.targets.length) || 1;

    // Normalizar features
    const normalizedFeatures = data.features.map(row => 
      row.map((val, i) => (val - featureMeans[i]) / featureStds[i])
    );

    // Normalizar targets
    const normalizedTargets = data.targets.map(val => (val - targetMean) / targetStd);

    return {
      features: normalizedFeatures,
      targets: normalizedTargets,
      normalizationParams: {
        featureMeans,
        featureStds,
        targetMean,
        targetStd
      }
    };
  }

  private normalizeInput(input: number[], normalizationParams: any): number[] {
    const { featureMeans, featureStds } = normalizationParams;
    return input.map((val, i) => (val - featureMeans[i]) / featureStds[i]);
  }

  private denormalizePrediction(prediction: number, normalizationParams: any): number {
    const { targetMean, targetStd } = normalizationParams;
    return prediction * targetStd + targetMean;
  }

  private buildEquation(features: string[], coefficients: number[]): string {
    let equation = `${features[0]} = `;
    for (let i = 0; i < coefficients.length - 1; i++) {
      if (i > 0) equation += ' + ';
      equation += `${coefficients[i].toFixed(4)} * ${features[i]}`;
    }
    equation += ` + ${coefficients[coefficients.length - 1].toFixed(4)}`;
    return equation;
  }

  private async saveModel(model: StoredModel): Promise<void> {
    const filePath = path.join(this.modelsDir, `${model.id}.json`);
    const modelData = {
      ...model,
      model: model.type === 'neural_network' ? 
        { ...model.model, tfModel: undefined } : // No guardar el modelo TF en JSON
        model.model
    };
    fs.writeFileSync(filePath, JSON.stringify(modelData, null, 2));
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
