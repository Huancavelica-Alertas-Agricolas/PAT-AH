jest.mock('bcryptjs', () => ({
  hash: jest.fn(async (pwd, salt) => 'hashed_' + pwd),
  compare: jest.fn(async (pwd, hashed) => hashed === 'hashed_' + pwd)
}));
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'signed_token')
}));

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AuthService } = require('../src/auth/auth.service');

describe('AuthService (unit)', () => {
  let authService;
  let mockUsersService;

  beforeEach(() => {
    mockUsersService = {
      create: jest.fn(async (data) => ({ id: 'u1', ...data })),
      findByPhone: jest.fn()
    };
    authService = new AuthService(mockUsersService);
    jest.clearAllMocks();
  });

  test('register: hashes password, creates user and returns token (no password in user)', async () => {
    const payload = { telefono: '999', password: 'secret', email: 'a@b.com', nombre: 'Juan' };
    const res = await authService.register(payload);
    expect(bcrypt.hash).toHaveBeenCalledWith('secret', 10);
    expect(mockUsersService.create).toHaveBeenCalled();
    expect(jwt.sign).toHaveBeenCalled();
    expect(res.token).toBe('signed_token');
    expect(res.user).toBeDefined();
    expect(res.user.password).toBeUndefined();
  });

  test('login: returns token and user when credentials valid', async () => {
    const storedUser = { id: 'u2', telefono: '999', password: 'hashed_secret', nombre: 'Test' };
    mockUsersService.findByPhone.mockResolvedValue(storedUser);
    const res = await authService.login('999', 'secret');
    expect(mockUsersService.findByPhone).toHaveBeenCalledWith('999');
    expect(bcrypt.compare).toHaveBeenCalledWith('secret', 'hashed_secret');
    expect(res).toBeDefined();
    expect(res.token).toBe('signed_token');
    expect(res.user.password).toBeUndefined();
  });

  test('login: returns null when user not found', async () => {
    mockUsersService.findByPhone.mockResolvedValue(null);
    const res = await authService.login('000', 'nopass');
    expect(res).toBeNull();
  });
});
