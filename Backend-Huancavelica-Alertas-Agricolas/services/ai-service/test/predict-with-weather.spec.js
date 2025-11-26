const { AiController } = require('../src/ai-microservice/ai.controller');

describe('AiController.predictWithWeather', () => {
  test('calls mlService.predict with provided weatherData and returns prediction', async () => {
    // Mock mlService and weatherService
    const mockMlService = {
      getModelsInfo: jest.fn().mockReturnValue([{ id: 'm1', features: ['f1', 'f2'] }]),
      predict: jest.fn().mockResolvedValue({ prediction: 42, confidence: 0.9 })
    };
    const mockWeatherService = {
      getCurrentWeather: jest.fn().mockResolvedValue({ temp: 20 }),
      getWeatherByCity: jest.fn().mockResolvedValue({ temp: 21 })
    };
    const mockExcelService = {};

    const controller = new AiController(mockExcelService, mockMlService, mockWeatherService);

    const req = {
      modelId: 'm1',
      inputData: { f1: 1, f2: 2 },
      weatherData: { temp: 15 }
    };

    const res = await controller.predictWithWeather(req);

    expect(mockMlService.predict).toHaveBeenCalledWith('m1', [1,2], { temp: 15 });
    expect(res).toEqual({ prediction: 42, confidence: 0.9 });
  });
});
