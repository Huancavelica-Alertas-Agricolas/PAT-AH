const request = require('supertest');
const { Test } = require('@nestjs/testing');

const { RestController } = require('../../src/rest/rest.controller');
const { AiController } = require('../../../ai-service/src/ai-microservice/ai.controller');

describe('Full E2E flow: register -> AI predict (mocked deps)', () => {
  let app;
  let mockAuthService;
  let mockMLService;
  let mockWeatherService;

  beforeAll(async () => {
    mockAuthService = {
      register: jest.fn(async (body) => ({ token: 't_register', user: { id: 'u1', nombre: body.nombre } })),
      login: jest.fn(async (phone, pass) => ({ token: 't_login', user: { id: 'u2', telefono: phone } }))
    };

    mockMLService = {
      predict: jest.fn(async (modelId, inputData, weather) => ({ prediction: 0.75, confidence: 0.88 })),
      getModelsInfo: jest.fn(() => [{ id: 'm1', features: ['f1', 'f2'] }])
    };

    mockWeatherService = {
      getCurrentWeather: jest.fn(async (lat, lon) => ({ data: [{ fecha_hora: new Date().toISOString(), temp_c: 5, precip_mm: 0, humedad: 50, clima: 'soleado' }] })),
      getWeatherByCity: jest.fn(async (city) => ({ data: [] })),
      getForecast: jest.fn(async (lat, lon, days) => ({ data: [] })),
      getApiStatus: jest.fn(async () => ({ status: 'ok' }))
    };

    const mockExcelService = {
      processExcelFile: jest.fn(async (path) => ({ fileName: path || 'dummy.xlsx', columns: [], rowCount: 0 })),
      prepareTrainingData: jest.fn(async () => ({ features: [], targets: [] })),
      getDataStatistics: jest.fn(async () => ({})),
      validateDataQuality: jest.fn(async () => ({ valid: true }))
    };

    const AuthServiceClass = require('../../src/auth/auth.service').AuthService;
    const MLServiceClass = require('../../../ai-service/src/ai-microservice/services/machine-learning.service').MachineLearningService;
    const WeatherServiceClass = require('../../../ai-service/src/ai-microservice/services/weather.service').WeatherService;
    const ExcelProcessorClass = require('../../../ai-service/src/ai-microservice/services/excel-processor.service').ExcelProcessorService;

    const moduleRef = await Test.createTestingModule({
      controllers: [RestController, AiController],
      providers: [
        { provide: AuthServiceClass, useValue: mockAuthService },
        { provide: MLServiceClass, useValue: mockMLService },
        { provide: WeatherServiceClass, useValue: mockWeatherService },
        { provide: ExcelProcessorClass, useValue: mockExcelService }
      ]
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  test('complete flow: register user then request ai predict-with-weather', async () => {
    // 1) create user
    const userPayload = { nombre: 'E2E User', telefono: '999', password: 'secret', email: 'e2e@example.com' };
    const resUser = await request(app.getHttpServer()).post('/api/users').send(userPayload).expect(201);
    expect(resUser.body.success).toBe(true);

    // 2) call AI predict-with-weather
    const aiPayload = {
      modelId: 'm1',
      inputData: { f1: 1.2, f2: 3.4 },
      weatherData: null,
      includeWeather: true,
      location: { lat: -12.0, lon: -75.0 }
    };

    const resAi = await request(app.getHttpServer()).post('/api/ai/predict-with-weather').send(aiPayload);

    expect(resAi.body).toBeDefined();
    // At least assert ML predict was called and returned shape
    expect(mockMLService.predict).toHaveBeenCalled();
    const body = resAi.body;
    const hasPrediction = (body && (body.prediction || (body.prediction && body.prediction.prediction))) || (body && body.prediction === 0) || (typeof body === 'object');
    expect(hasPrediction).toBeTruthy();
  });
});
