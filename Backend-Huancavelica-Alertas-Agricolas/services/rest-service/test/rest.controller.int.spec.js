const request = require('supertest');
const { Test } = require('@nestjs/testing');
const { INestApplication } = require('@nestjs/common');

const { RestController } = require('../src/rest/rest.controller');
const { AuthService } = require('../src/auth/auth.service');

describe('RestController (integration)', () => {
  let app;
  let mockAuthService;

  beforeAll(async () => {
    mockAuthService = {
      register: jest.fn(async (body) => ({ token: 't_register', user: { id: 'u1', nombre: body.nombre } })),
      login: jest.fn(async (phone, pass) => ({ token: 't_login', user: { id: 'u2', telefono: phone } }))
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [RestController],
      providers: [{ provide: AuthService, useValue: mockAuthService }]
    }).compile();

    app = moduleRef.createNestApplication();
    // Register jwt middleware in the test app so /api/me is evaluated
    try {
      const { jwtMiddleware } = require('../src/auth/jwt.middleware');
      app.use(jwtMiddleware);
    }
    catch (e) {
      // swallow in tests
    }
    // Emular prefijo global '/api' para coincidir con producción
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  test('POST /api/users -> create user', async () => {
    const payload = { nombre: 'Juan', telefono: '999', password: 'secret', email: 'a@b.com' };
    const res = await request(app.getHttpServer()).post('/api/users').send(payload).expect(201);
    expect(res.body).toBeDefined();
    expect(res.body.success).toBe(true);
    expect(res.body.user).toBeDefined();
    expect(mockAuthService.register).toHaveBeenCalledWith(expect.objectContaining({ nombre: 'Juan' }));
  });

  test('POST /api/auth/login -> login user', async () => {
    const payload = { phone: '999', password: 'secret' };
    const res = await request(app.getHttpServer()).post('/api/auth/login').send(payload).expect(200);
    expect(res.body).toBeDefined();
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBe('t_login');
    expect(mockAuthService.login).toHaveBeenCalledWith('999', 'secret');
  });

  test('GET /api/me returns decoded token payload when Authorization header present', async () => {
    // Simulate login returned token
    const token = 'signed_test_token';
    // Mock jwt.verify by issuing a token with known payload in the middleware (jwtMiddleware uses jsonwebtoken.verify)
    // For the test, call /api/me with a fake token — since jwtMiddleware uses real jwt.verify, we can create a valid token
    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET || 'dev_jwt_secret';
    const validToken = jwt.sign({ sub: 'u-test', role: 'user' }, secret, { expiresIn: '1h' });

    const res = await request(app.getHttpServer()).get('/api/me').set('Authorization', `Bearer ${validToken}`).expect(200);
    expect(res.body).toBeDefined();
    expect(res.body.authenticated).toBe(true);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.sub).toBe('u-test');
  });

  test('GET /api/me with invalid token should be anonymous', async () => {
    const res = await request(app.getHttpServer()).get('/api/me').set('Authorization', `Bearer invalid.token.here`).expect(200);
    expect(res.body).toBeDefined();
    expect(res.body.authenticated).toBe(false);
  });

  test('GET /api/me with expired token should be anonymous', async () => {
    const jwt = require('jsonwebtoken');
    const secret = process.env.JWT_SECRET || 'dev_jwt_secret';
    // Create a token already expired
    const expiredToken = jwt.sign({ sub: 'u-expired' }, secret, { expiresIn: '-1s' });
    const res = await request(app.getHttpServer()).get('/api/me').set('Authorization', `Bearer ${expiredToken}`).expect(200);
    expect(res.body).toBeDefined();
    expect(res.body.authenticated).toBe(false);
  });
});
