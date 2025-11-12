export class ExcelDataDto {
  fileName: string;
  columns: string[];
  data: any[];
  rowCount: number;
  uploadDate: Date;
}

export class TrainingDataDto {
  features: number[][];
  targets: number[];
  featureNames: string[];
  targetName: string;
}

export class PredictionRequestDto {
  modelId: string;
  inputData: number[] | { [key: string]: number };
  weatherData?: WeatherDataDto;
}

export class WeatherDataDto {
  temperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  pressure: number;
  date: string;
  location?: string;
}

export class ModelInfoDto {
  id: string;
  name: string;
  type: 'linear' | 'multivariate' | 'neural_network';
  accuracy: number;
  createdAt: Date;
  lastTrained: Date;
  features: string[];
  target: string;
  isActive: boolean;
}

export class PredictionResultDto {
  prediction: number | number[];
  confidence: number;
  modelUsed: string;
  inputData: any;
  timestamp: Date;
  weatherInfluence?: number;
}

export class TrainingResultDto {
  success: boolean;
  modelId: string;
  accuracy: number;
  error?: string;
  trainingTime: number;
  metrics: {
    mse?: number;
    rmse?: number;
    r2?: number;
  };
}
