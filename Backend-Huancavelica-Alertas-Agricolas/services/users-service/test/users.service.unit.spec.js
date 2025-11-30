const { UsersService } = require('../../src/users/users.service');

describe('UsersService (unit)', () => {
  let service;
  let mockPrisma;

  beforeEach(() => {
    mockPrisma = {
      user: {
        create: jest.fn().mockResolvedValue({ id: 1, telefono: '123' }),
        findUnique: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    service = new UsersService(mockPrisma);
  });

  test('create delegates to prisma.user.create', async () => {
    const data = { telefono: '123' };
    const res = await service.create(data);
    expect(mockPrisma.user.create).toHaveBeenCalledWith({ data });
    expect(res).toEqual({ id: 1, telefono: '123' });
  });

  test('findByPhone calls prisma.user.findUnique', async () => {
    await service.findByPhone('123');
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { telefono: '123' } });
  });

  test('findAll calls prisma.user.findMany', async () => {
    const res = await service.findAll();
    expect(mockPrisma.user.findMany).toHaveBeenCalled();
    expect(Array.isArray(res)).toBe(true);
  });
});
