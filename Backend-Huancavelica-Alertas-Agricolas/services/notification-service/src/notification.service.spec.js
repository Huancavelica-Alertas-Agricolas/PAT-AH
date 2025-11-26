const { Test, TestingModule } = require('@nestjs/testing');
const { NotificationService } = require('./notification.service');
const { MailService } = require('./mail/mail.service');

describe('NotificationService', () => {
  let service;

  beforeEach(async () => {
    const mockMailService = { sendMail: jest.fn(), sendPlainTextMail: jest.fn(), sendWelcomeEmail: jest.fn() };
    const module = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();
    service = module.get(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Agrega aquí más tests unitarios
});