import { 
  Controller, 
  Post, 
  Get, 
  Delete, 
  Body, 
  Param, 
  UploadedFile, 
  UseInterceptors,
  BadRequestException,
  Query
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { multer } from 'multer';
import * as path from 'path';
import { ExcelProcessorService } from '../services/excel-processor.service';
import { MachineLearningServiceSimple } from '../services/machine-learning-simple.service';
import { WeatherService } from '../services/weather.service';
import { 
  PredictionRequestDto, 
  TrainingResultDto, 
  PredictionResultDto,
  ModelInfoDto
} from '../dto/excel-data.dto';

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    callback(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req: any, file: any, callback: any) => {
  if (file.mimetype.includes('excel') || file.mimetype.includes('spreadsheet') || 
      file.originalname.endsWith('.xlsx') || file.originalname.endsWith('.xls')) {
    callback(null, true);
  } else {
    callback(new BadRequestException('Solo se permiten archivos Excel (.xlsx, .xls)'), false);
  }
};

@Controller('ai')
export class AiController {
  constructor(
    private readonly excelService: ExcelProcessorService,
    private readonly mlService: MachineLearningServiceSimple,
    private readonly weatherService: WeatherService
  ) {}

  /**
   * Subir y procesar archivo Excel
   */
  @Post('upload-excel')
  @UseInterceptors(FileInterceptor('file', {
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB límite
  }))
  async uploadExcel(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se proporcionó archivo Excel');
    }

    try {
      const excelData = await this.excelService.processExcelFile(file.path);
      const statistics = await this.excelService.getDataStatistics(excelData);
      const quality = await this.excelService.validateDataQuality(excelData);

      return {
        success: true,
        message: 'Archivo Excel procesado exitosamente',
        data: excelData,
        statistics,
        quality,
        fileInfo: {
          originalName: file.originalname,
          size: file.size,
          path: file.path
        }
      };
    } catch (error) {
      throw new BadRequestException(`Error procesando archivo: ${error.message}`);
    }
  }

  /**
   * Entrenar modelo de Machine Learning
   */
  @Post('train-model')
  async trainModel(@Body() trainingRequest: {
    filePath: string;
    targetColumn: string;
    featureColumns: string[];
    modelType: 'linear' | 'multivariate' | 'neural_network';
    modelName?: string;
    neuralNetworkConfig?: {
      hiddenLayers?: number[];
      epochs?: number;
    };
  }): Promise<TrainingResultDto> {
    try {
      // Procesar datos del Excel
      const excelData = await this.excelService.processExcelFile(trainingRequest.filePath);
      const trainingData = await this.excelService.prepareTrainingData(
        excelData,
        trainingRequest.targetColumn,
        trainingRequest.featureColumns
      );

      // Validar que hay suficientes datos
      if (trainingData.features.length < 10) {
        throw new BadRequestException('Se necesitan al menos 10 filas de datos válidos para entrenar');
      }

      let result: TrainingResultDto;

      switch (trainingRequest.modelType) {
        case 'linear':
          if (trainingRequest.featureColumns.length !== 1) {
            throw new BadRequestException('Regresión lineal requiere exactamente una característica');
          }
          result = await this.mlService.trainLinearModel(
            trainingData, 
            trainingRequest.modelName
          );
          break;

        case 'multivariate':
          result = await this.mlService.trainMultivariateModel(
            trainingData, 
            trainingRequest.modelName
          );
          break;

        case 'neural_network':
          const hiddenLayers = trainingRequest.neuralNetworkConfig?.hiddenLayers || [64, 32];
          result = await this.mlService.trainNeuralNetworkModel(
            trainingData, 
            trainingRequest.modelName,
            hiddenLayers
          );
          break;

        default:
          throw new BadRequestException(`Tipo de modelo no soportado: ${trainingRequest.modelType}`);
      }

      return result;
    } catch (error) {
      throw new BadRequestException(`Error entrenando modelo: ${error.message}`);
    }
  }

  /**
   * Realizar predicción con modelo entrenado
   */
  @Post('predict')
  async predict(@Body() request: {
    modelId: string;
    inputData: number[];
    includeWeather?: boolean;
    location?: { lat: number; lon: number } | { city: string };
  }): Promise<PredictionResultDto> {
    try {
      let weatherData;

      // Obtener datos meteorológicos si se solicita
      if (request.includeWeather && request.location) {
        if ('lat' in request.location) {
          weatherData = await this.weatherService.getCurrentWeather(
            request.location.lat, 
            request.location.lon
          );
        } else {
          weatherData = await this.weatherService.getWeatherByCity(request.location.city);
        }
      }

      const prediction = await this.mlService.predict(
        request.modelId,
        request.inputData,
        weatherData
      );

      return prediction;
    } catch (error) {
      throw new BadRequestException(`Error realizando predicción: ${error.message}`);
    }
  }

  /**
   * Realizar predicción con datos climáticos específicos
   */
  @Post('predict-with-weather')
  async predictWithWeather(@Body() request: PredictionRequestDto): Promise<PredictionResultDto> {
    try {
      // Procesar datos de entrada como array si es un objeto
      let inputData: number[];
      if (Array.isArray(request.inputData)) {
        inputData = request.inputData;
      } else {
        // Convertir objeto a array basado en las características del modelo
        const models = this.mlService.getModelsInfo();
        const model = models.find(m => m.id === request.modelId);
        if (!model) {
          throw new BadRequestException(`Modelo ${request.modelId} no encontrado`);
        }

        inputData = model.features.map(feature => 
          request.inputData[feature] || 0
        );
      }

      const prediction = await this.mlService.predict(
        request.modelId,
        inputData,
        request.weatherData
      );

      return prediction;
    } catch (error) {
      throw new BadRequestException(`Error realizando predicción: ${error.message}`);
    }
  }

  /**
   * Obtener información de modelos disponibles
   */
  @Get('models')
  getModels(): ModelInfoDto[] {
    return this.mlService.getModelsInfo();
  }

  /**
   * Obtener información de un modelo específico
   */
  @Get('models/:id')
  getModel(@Param('id') modelId: string): ModelInfoDto {
    const models = this.mlService.getModelsInfo();
    const model = models.find(m => m.id === modelId);
    
    if (!model) {
      throw new BadRequestException(`Modelo ${modelId} no encontrado`);
    }

    return model;
  }

  /**
   * Eliminar un modelo
   */
  @Delete('models/:id')
  async deleteModel(@Param('id') modelId: string): Promise<{ success: boolean; message: string }> {
    const success = await this.mlService.deleteModel(modelId);
    
    return {
      success,
      message: success ? 'Modelo eliminado exitosamente' : 'No se pudo eliminar el modelo'
    };
  }

  /**
   * Obtener datos meteorológicos actuales
   */
  @Get('weather/current')
  async getCurrentWeather(
    @Query('lat') lat?: number,
    @Query('lon') lon?: number,
    @Query('city') city?: string
  ) {
    try {
      if (city) {
        return await this.weatherService.getWeatherByCity(city);
      } else if (lat !== undefined && lon !== undefined) {
        return await this.weatherService.getCurrentWeather(lat, lon);
      } else {
        // Coordenadas por defecto (Lima, Perú)
        return await this.weatherService.getCurrentWeather(-12.0464, -77.0428);
      }
    } catch (error) {
      throw new BadRequestException(`Error obteniendo datos del clima: ${error.message}`);
    }
  }

  /**
   * Obtener pronóstico del tiempo
   */
  @Get('weather/forecast')
  async getForecast(
    @Query('lat') lat?: number,
    @Query('lon') lon?: number,
    @Query('city') city?: string,
    @Query('days') days?: number
  ) {
    try {
      const forecastDays = days || 5;

      if (city) {
        // Primero obtener coordenadas de la ciudad
        const currentWeather = await this.weatherService.getWeatherByCity(city);
        // Para el forecast necesitamos las coordenadas, aquí usaremos coordenadas por defecto
        return await this.weatherService.getForecast(-12.0464, -77.0428, forecastDays);
      } else if (lat !== undefined && lon !== undefined) {
        return await this.weatherService.getForecast(lat, lon, forecastDays);
      } else {
        throw new BadRequestException('Se requieren coordenadas (lat, lon) o nombre de ciudad');
      }
    } catch (error) {
      throw new BadRequestException(`Error obteniendo pronóstico: ${error.message}`);
    }
  }

  /**
   * Obtener estado de la API del clima
   */
  @Get('weather/status')
  async getWeatherApiStatus() {
    return await this.weatherService.getApiStatus();
  }

  /**
   * Análisis completo: predicción con múltiples modelos
   */
  @Post('analyze-complete')
  async completeAnalysis(@Body() request: {
    inputData: number[];
    location?: { lat: number; lon: number } | { city: string };
    includeWeather?: boolean;
  }) {
    try {
      const models = this.mlService.getModelsInfo();
      
      if (models.length === 0) {
        throw new BadRequestException('No hay modelos entrenados disponibles');
      }

      // Obtener datos meteorológicos si se solicita
      let weatherData;
      if (request.includeWeather && request.location) {
        if ('lat' in request.location) {
          weatherData = await this.weatherService.getCurrentWeather(
            request.location.lat, 
            request.location.lon
          );
        } else {
          weatherData = await this.weatherService.getWeatherByCity(request.location.city);
        }
      }

      // Realizar predicciones con todos los modelos disponibles
      const predictions = [];
      for (const model of models) {
        try {
          const prediction = await this.mlService.predict(
            model.id,
            request.inputData,
            weatherData
          );
          predictions.push({
            modelInfo: model,
            prediction
          });
        } catch (error) {
          predictions.push({
            modelInfo: model,
            error: error.message
          });
        }
      }

      // Calcular predicción promedio de modelos exitosos
      const successfulPredictions = predictions
        .filter(p => !p.error && typeof p.prediction.prediction === 'number')
        .map(p => p.prediction.prediction as number);

      const averagePrediction = successfulPredictions.length > 0 ?
        successfulPredictions.reduce((a, b) => a + b, 0) / successfulPredictions.length :
        null;

      return {
        success: true,
        averagePrediction,
        weatherData,
        modelPredictions: predictions,
        summary: {
          totalModels: models.length,
          successfulPredictions: successfulPredictions.length,
          averageConfidence: predictions
            .filter(p => !p.error)
            .reduce((sum, p) => sum + p.prediction.confidence, 0) / 
            predictions.filter(p => !p.error).length || 0
        }
      };
    } catch (error) {
      throw new BadRequestException(`Error en análisis completo: ${error.message}`);
    }
  }

  /**
   * Health check del microservicio
   */
  @Get('health')
  async healthCheck() {
    const weatherStatus = await this.weatherService.getApiStatus();
    const models = this.mlService.getModelsInfo();

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        excelProcessor: 'ok',
        machineLearning: 'ok',
        weather: weatherStatus.status
      },
      modelsCount: models.length,
      version: '1.0.0'
    };
  }
}
