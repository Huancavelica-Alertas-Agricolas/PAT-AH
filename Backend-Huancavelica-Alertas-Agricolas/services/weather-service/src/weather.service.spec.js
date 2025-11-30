const { Test } = require('@nestjs/testing');
const { WeatherService } = require('./weather.service');
const { HttpService } = require('@nestjs/axios');
const { ConfigService } = require('@nestjs/config');

describe('WeatherService', () => {
  let service;

  beforeEach(async () => {
    const mockHttpService = { get: jest.fn(), post: jest.fn() };
    const mockConfigService = { get: jest.fn() };
    const module = await Test.createTestingModule({
      providers: [
        WeatherService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();
    service = module.get(WeatherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Agrega aquí más tests unitarios
});
