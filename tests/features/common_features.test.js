import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock variables
const mockCreateActivity = jest.fn();
const mockFindManyActivity = jest.fn();
const mockFindManyLayanan = jest.fn();
const mockCreateNotification = jest.fn();
const mockFindManyNotification = jest.fn();

const mockGet = jest.fn();

jest.unstable_mockModule('axios', () => {
  return {
    __esModule: true,
    default: {
      get: mockGet
    }
  };
});

jest.unstable_mockModule('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => {
      return {
        activity: {
          create: mockCreateActivity,
          findMany: mockFindManyActivity
        },
        layanan: {
          findMany: mockFindManyLayanan
        },
        notification: {
          create: mockCreateNotification,
          findMany: mockFindManyNotification
        }
      };
    })
  };
});

// Dynamic imports
const { default: request } = await import('supertest');
const { default: app } = await import('../../src/app.js');
const { default: axios } = await import('axios');

describe('Common Features (Activity, Layanan, Home, Notification) Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Activity Logger', () => {
    test('POST /activity - success', async () => {
      mockCreateActivity.mockResolvedValue({ id: 'act-1', userId: 'user-1' });

      const res = await request(app)
        .post('/activity')
        .send({
          userId: 'user-1',
          feature: 'Transjatim',
          description: 'Mengecek koridor JTM1'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(mockCreateActivity).toHaveBeenCalled();
    });

    test('GET /activity/:userId - success', async () => {
      mockFindManyActivity.mockResolvedValue([
        { id: 'act-1', feature: 'Transjatim', description: 'desc', createdAt: new Date() }
      ]);

      const res = await request(app).get('/activity/user-1');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe('Layanan Catalog', () => {
    test('GET /layanan/integrated - success', async () => {
      mockFindManyLayanan.mockResolvedValue([
        { id: 'lay-1', icon: 'icon.png', nama: 'Sapa Bansos', slug: 'sapa-bansos', deskripsi_singkat: 'bansos desc' }
      ]);

      const res = await request(app).get('/layanan/integrated');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data[0].nama).toBe('Sapa Bansos');
    });
  });

  describe('Home Page Features', () => {
    test('GET /home/beranda - success metrics mapping', async () => {
      mockGet.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            banner: [],
            news: []
          }
        }
      });

      const res = await request(app).get('/home/beranda');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('GET /home/kategori-layanan-daerah - success', async () => {
      mockGet.mockResolvedValueOnce({
        data: { data: [] }
      });

      const res = await request(app).get('/home/kategori-layanan-daerah');
      expect(res.statusCode).toBe(200);
    });

    test('GET /home/jatim-angka - success', async () => {
      mockGet.mockResolvedValueOnce({
        data: { data: {} }
      });

      const res = await request(app).get('/home/jatim-angka');
      expect(res.statusCode).toBe(200);
    });
  });

  describe('User Notifications', () => {
    test('POST /notification - success', async () => {
      mockCreateNotification.mockResolvedValue({ id: 'notif-1' });

      const res = await request(app)
        .post('/notification')
        .send({
          userId: 'user-1',
          title: 'Halo',
          message: 'Notifikasi test'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
    });

    test('GET /notification/:userId - success', async () => {
      mockFindManyNotification.mockResolvedValue([
        { id: 'notif-1', title: 'Halo', message: 'Notifikasi test', createdAt: new Date() }
      ]);

      const res = await request(app).get('/notification/user-1');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
    });
  });
});
