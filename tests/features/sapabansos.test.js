import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock variables
const mockFindUnique = jest.fn();
const mockActivityCreate = jest.fn();

jest.unstable_mockModule('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => {
      return {
        user: {
          findUnique: mockFindUnique,
          findFirst: jest.fn(),
          create: jest.fn(),
          update: jest.fn()
        },
        activity: {
          create: mockActivityCreate
        }
      };
    })
  };
});

// Dynamic imports
const { default: request } = await import('supertest');
const { default: app } = await import('../../src/app.js');

describe('Sapa Bansos Feature Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /sapa-bansos/user/:userID - Eligible User (In Mock Profile)', async () => {
    mockFindUnique.mockResolvedValue({
      id: '3201011760371377',
      name: 'Budi Santoso DB',
      email: 'budi@db.com'
    });

    const res = await request(app)
      .get('/sapa-bansos/user/3201011760371377');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.nik).toBe('3201011760371377');
    expect(res.body.data.name).toBe('Budi Santoso DB');
    expect(res.body.data.tanggalPengambilan).toBeDefined();
    expect(res.body.data.tanggalPengambilanFormatted).toContain('25');
  });

  test('GET /sapa-bansos/user/:userID - Not Eligible User', async () => {
    mockFindUnique.mockResolvedValue(null);

    const res = await request(app)
      .get('/sapa-bansos/user/9999999999999999');

    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.message).toBe('Kamu tidak terdaftar pada penerima bansos');
  });
});
