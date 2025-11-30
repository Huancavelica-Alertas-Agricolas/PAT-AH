const { UsersService } = require('./users.service');

describe('UsersService (unit)', () => {
  let service;
  const mockPrisma = {
    user: {
      create: jest.fn().mockResolvedValue({ id: 1, telefono: '999', email: 'a@b.com' }),
      findUnique: jest.fn().mockResolvedValue({ id: 1, telefono: '999', email: 'a@b.com' }),
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  beforeEach(() => {
    service = new UsersService(mockPrisma);
    jest.clearAllMocks();
  });

  test('create should call prisma.user.create and return a user', async () => {
    const data = { telefono: '999', email: 'a@b.com', password: 'secret' };
    const res = await service.create(data);
    expect(mockPrisma.user.create).toHaveBeenCalledWith({ data });
    expect(res).toBeDefined();
    expect(res.telefono).toBe('999');
  });

  test('findByPhone should call prisma.user.findUnique', async () => {
    const phone = '999';
    const res = await service.findByPhone(phone);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { telefono: phone } });
    expect(res).toBeDefined();
  });

  test('findAll should call prisma.user.findMany', async () => {
    const res = await service.findAll();
    expect(mockPrisma.user.findMany).toHaveBeenCalled();
    expect(Array.isArray(res)).toBe(true);
  });
});
