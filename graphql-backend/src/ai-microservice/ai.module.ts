import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AiController } from './ai.controller';
import { ExcelProcessorService } from './services/excel-processor.service';
import { MachineLearningServiceSimple } from './services/machine-learning-simple.service';
import { WeatherService } from './services/weather.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads', // Directorio de destino para archivos subidos
    }),
  ],
  controllers: [AiController],
  providers: [
    ExcelProcessorService,
    MachineLearningServiceSimple,
    WeatherService,
  ],
  exports: [
    ExcelProcessorService,
    MachineLearningServiceSimple,
    WeatherService,
  ],
})
export class AiModule {}
