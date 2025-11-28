const { Test } = require('@nestjs/testing');
const { AlertService } = require('./alert.service');

describe('AlertService', () => {
  let service;

  beforeEach(async () => {
    const mockClient = { send: jest.fn(), emit: jest.fn() };
    const module = await Test.createTestingModule({
      providers: [
        AlertService,
        { provide: 'WEATHER_SERVICE', useValue: mockClient },
        { provide: 'NOTIFICATION_SERVICE', useValue: mockClient },
        { provide: 'USER_SERVICE', useValue: mockClient },
      ],
    }).compile();
    service = module.get(AlertService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Add more unit tests here
});

