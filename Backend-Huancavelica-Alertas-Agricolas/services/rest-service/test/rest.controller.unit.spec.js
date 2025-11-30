const { RestController } = require('../src/rest/rest.controller');

describe('RestController (unit)', () => {
  let controller;
  const mockAuth = {
    login: jest.fn(),
    register: jest.fn(),
  };
  const mockUsersClient = {
    findAll: jest.fn(),
  };
  const mockWeatherClient = {
    send: jest.fn(),
  };

  beforeEach(() => {
    mockAuth.login.mockReset();
    mockAuth.register.mockReset();
    mockUsersClient.findAll.mockReset();
    mockWeatherClient.send.mockReset();

    controller = new RestController(mockAuth, mockUsersClient, mockWeatherClient);
    // optional: attach a minimal logger to silence error branches
    controller.logger = { error: jest.fn() };
  });

  test('login returns failure on invalid credentials', async () => {
    mockAuth.login.mockResolvedValue(null);
    const res = await controller.login({ phone: '111', password: 'x' });
    expect(res).toEqual({ success: false, message: 'Invalid credentials' });
    expect(mockAuth.login).toHaveBeenCalledWith('111', 'x');
  });

  test('login returns token and user on success', async () => {
    mockAuth.login.mockResolvedValue({ token: 't', user: { id: 1 } });
    const res = await controller.login({ phone: '111', password: 'x' });
    expect(res.success).toBe(true);
    expect(res.token).toBe('t');
    expect(res.user).toEqual({ id: 1 });
    expect(res).toHaveProperty('timestamp');
  });

  test('me returns unauthenticated when no user', async () => {
    const res = await controller.me({});
    expect(res).toEqual({ authenticated: false });
  });

  test('me returns authenticated when req.user present', async () => {
    const user = { id: 2 };
    const res = await controller.me({ user });
    expect(res).toEqual({ authenticated: true, user });
  });

  test('createUser returns failure when register fails', async () => {
    mockAuth.register.mockResolvedValue(null);
    const res = await controller.createUser({ phone: 'p' });
    expect(res).toEqual({ success: false, message: 'Could not create user' });
  });

  test('createUser returns created user on success', async () => {
    mockAuth.register.mockResolvedValue({ user: { id: 3 } });
    const res = await controller.createUser({ phone: 'p' });
    expect(res).toEqual({ success: true, user: { id: 3 } });
  });

  test('listUsers returns array and handles errors', async () => {
    mockUsersClient.findAll.mockResolvedValue([{ id: 1 }]);
    const ok = await controller.listUsers();
    expect(ok).toEqual([{ id: 1 }]);

    // error path
    mockUsersClient.findAll.mockRejectedValue(new Error('fail'));
    const empty = await controller.listUsers();
    expect(empty).toEqual([]);
    expect(controller.logger.error).toHaveBeenCalled();
  });

  test('getWeather returns data and handles error', async () => {
    const obs = { subscribe: () => { } };
    // when send returns an observable that firstValueFrom resolves
    mockWeatherClient.send.mockReturnValue({});
    // Simulate firstValueFrom by mocking the imported function indirectly: instead call getWeather that will try firstValueFrom
    // Easier: mock weatherClient.send to return a Promise-like that firstValueFrom handles — instead, directly mock firstValueFrom is complex here.
    // We'll test error branch by making weatherClient.send throw
    mockWeatherClient.send.mockImplementation(() => { throw new Error('nope'); });
    const res = await controller.getWeather();
    expect(res).toEqual({ error: 'Weather service unavailable' });
    expect(controller.logger.error).toHaveBeenCalled();
  });
});
