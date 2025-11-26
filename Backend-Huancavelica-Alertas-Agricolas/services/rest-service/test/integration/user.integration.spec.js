const request = require('supertest');
// Increase Jest timeout for slow integration setup inside containers
jest.setTimeout(180000);
const { Test } = require('@nestjs/testing');

// Integration tests require a running Postgres test DB.
// To run locally use the helper script which brings up a compose test network:
//   PowerShell: npm run test:integration:docker:ps1
//   Bash:      npm run test:integration:docker:sh
// By default these tests are skipped unless you set `RUN_INTEGRATION=1` in the env.
if (!process.env.RUN_INTEGRATION) {
  describe.skip('User registration (integration with Postgres)', () => {
    test('skipped - set RUN_INTEGRATION=1 to run', () => { });
  });
} else {
  // Set DB URL expected by Prisma/PrismaService before importing app modules
  // When running inside the test compose network, connect to the `db` service by name.
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@db:5432/rest_test?schema=public';

  const { RestController } = require('../../src/rest/rest.controller');
  const { AuthService } = require('../../src/auth/auth.service');
  const { UsersService } = require('../../src/users/users.service');
  const { PrismaService } = require('../../src/shared');

  describe('User registration (integration with Postgres)', () => {
  let app;
  let moduleRef;
  let prisma;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      controllers: [RestController],
      providers: [AuthService, UsersService, PrismaService]
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();

    prisma = moduleRef.get(PrismaService);
    // Clean users table before tests
    await prisma.user.deleteMany();
  }, 20000);

  afterAll(async () => {
    if (app) await app.close();
    if (prisma) await prisma.$disconnect();
  });

  test('POST /api/users persists a user in Postgres', async () => {
    const payload = { nombre: 'ITest', telefono: '9999991', password: 'secret', email: 'itest@example.com' };
    const res = await request(app.getHttpServer()).post('/api/users').send(payload).expect(201);
    expect(res.body).toBeDefined();
    expect(res.body.success).toBe(true);
    expect(res.body.user).toBeDefined();

    // Verify user exists in DB
    const dbUser = await prisma.user.findUnique({ where: { telefono: payload.telefono } });
    expect(dbUser).toBeDefined();
    expect(dbUser.email).toBe(payload.email);
  }, 20000);
});
}
