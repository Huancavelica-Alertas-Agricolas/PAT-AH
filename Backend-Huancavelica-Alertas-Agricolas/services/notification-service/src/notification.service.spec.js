const NotificationService = require('./notification.service');

describe('NotificationService (unit)', () => {
  let service;
  const mockMailService = {
    sendMail: jest.fn().mockResolvedValue(true),
    sendPlainTextMail: jest.fn().mockResolvedValue(true),
    sendWelcomeEmail: jest.fn().mockResolvedValue(true),
    sendWeatherAlert: jest.fn().mockResolvedValue(true),
  };

  beforeEach(() => {
    service = new NotificationService(mockMailService);
    jest.clearAllMocks();
  });

  test('should be defined', () => {
    expect(service).toBeDefined();
  });

  test('sendEmail returns success when mailService resolves', async () => {
    const res = await service.sendEmail('a@b.com', 'subj', 'tpl', {});
    expect(mockMailService.sendMail).toHaveBeenCalled();
    expect(res.success).toBe(true);
  });

  test('sendPlainTextEmail returns success when mailService resolves', async () => {
    const res = await service.sendPlainTextEmail('a@b.com', 'subj', 'hi');
    expect(mockMailService.sendPlainTextMail).toHaveBeenCalled();
    expect(res.success).toBe(true);
  });

  test('sendWelcomeEmail returns success when mailService resolves', async () => {
    const res = await service.sendWelcomeEmail('a@b.com', 'Name');
    expect(mockMailService.sendWelcomeEmail).toHaveBeenCalled();
    expect(res.success).toBe(true);
  });
});