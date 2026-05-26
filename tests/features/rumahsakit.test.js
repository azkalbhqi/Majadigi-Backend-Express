import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock variables
const mockCreateDaha = jest.fn();
const mockFindFirstDaha = jest.fn();
const mockCreateMedical = jest.fn();
const mockFindManyDaha = jest.fn();

const mockCreateSoetomo = jest.fn();
const mockFindManySoetomo = jest.fn();
const mockCreateAmbulance = jest.fn();
const mockFindManyAmbulance = jest.fn();

const mockCreateHaji = jest.fn();
const mockFindManyHaji = jest.fn();

const mockCreateKarsa = jest.fn();
const mockFindManyKarsa = jest.fn();

const mockCreateSaiful = jest.fn();
const mockFindManySaiful = jest.fn();

const mockFindUniqueUser = jest.fn();
const mockUpsertHealthUser = jest.fn();
const mockCreateActivity = jest.fn();

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
        user: { findUnique: mockFindUniqueUser },
        healthUser: { upsert: mockUpsertHealthUser },
        activity: { create: mockCreateActivity },
        pendaftaranDahaHusada: { create: mockCreateDaha, findMany: mockFindManyDaha },
        pendaftaranSoetomo: { create: mockCreateSoetomo, findMany: mockFindManySoetomo },
        pendaftaranHajiJatim: { create: mockCreateHaji, findMany: mockFindManyHaji },
        pendaftaranKarsahusada: { create: mockCreateKarsa, findMany: mockFindManyKarsa },
        pendaftaranSaifulAnwar: { create: mockCreateSaiful, findMany: mockFindManySaiful },
        pendaftaranAmbulansSoetomo: { create: mockCreateAmbulance, findMany: mockFindManyAmbulance },
        rumahSakit: { findFirst: mockFindFirstDaha },
        medicalRecord: { create: mockCreateMedical }
      };
    })
  };
});

// Dynamic imports
const { default: request } = await import('supertest');
const { default: app } = await import('../../src/app.js');
const { default: axios } = await import('axios');

describe('Hospitals (Rumah Sakit) Feature Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindUniqueUser.mockResolvedValue({ id: 'user-1', name: 'Test User' });
  });

  describe('RSUD Daha Husada', () => {
    test('GET /daha-husada/rooms - success', async () => {
      mockGet.mockResolvedValueOnce({
        data: [{ class: 'VIP', available: 5 }]
      });

      const res = await request(app).get('/daha-husada/rooms');
      expect(res.statusCode).toBe(200);
      expect(res.body[0].class).toBe('VIP');
    });

    test('GET /daha-husada/polyclinics - success', async () => {
      mockGet.mockResolvedValueOnce({
        data: [{ id: 1, name: 'Poli Umum' }]
      });

      const res = await request(app).get('/daha-husada/polyclinics');
      expect(res.statusCode).toBe(200);
      expect(res.body[0].name).toBe('Poli Umum');
    });

    test('GET /daha-husada/surgery-schedule - success', async () => {
      mockGet.mockResolvedValueOnce({
        data: [{ id: 101, patient: 'Patient A', time: '10:00' }]
      });

      const res = await request(app).get('/daha-husada/surgery-schedule');
      expect(res.statusCode).toBe(200);
      expect(res.body[0].patient).toBe('Patient A');
    });

    test('GET /daha-husada/:id/doctor - success', async () => {
      mockGet.mockResolvedValueOnce({
        data: [{ id: 7, name: 'dr. John Doe' }]
      });

      const res = await request(app).get('/daha-husada/1/doctor');
      expect(res.statusCode).toBe(200);
      expect(res.body[0].name).toBe('dr. John Doe');
    });

    test('GET /daha-husada/queue/:polyclinicId/doctor/:doctorId - success', async () => {
      mockGet.mockResolvedValueOnce({
        data: { current: 12, total: 30 }
      });

      const res = await request(app).get('/daha-husada/queue/1/doctor/7');
      expect(res.statusCode).toBe(200);
      expect(res.body.current).toBe(12);
    });

    test('POST /daha-husada/register - success NON_JKN', async () => {
      mockCreateDaha.mockResolvedValue({ id: 'reg-123' });
      mockFindFirstDaha.mockResolvedValue({ id: 1, name: 'RSUD Daha Husada' });
      mockCreateMedical.mockResolvedValue({ id: 'med-123' });

      const res = await request(app)
        .post('/daha-husada/register')
        .send({
          userId: 'user-1',
          tipePasien: 'NON_JKN',
          nomorIdentitas: '123456789', // 9 digits
          tanggalLahir: '2000-01-01',
          dokter: 'dr. John Doe',
          keluhan: 'Batuk pilek'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Registration successful');
    });

    test('GET /daha-husada/history/:userId - success', async () => {
      mockFindManyDaha.mockResolvedValue([{ id: 'reg-123', status: 'PENDING' }]);

      const res = await request(app).get('/daha-husada/history/user-1');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
    });
  });

  describe('RSUD Dr. Soetomo', () => {
    test('GET /soetomo/rooms - success', async () => {
      mockGet.mockResolvedValueOnce({
        data: [{ class: 'Class I', available: 10 }]
      });

      const res = await request(app).get('/soetomo/rooms');
      expect(res.statusCode).toBe(200);
    });

    test('POST /soetomo/register - success JKN', async () => {
      mockCreateSoetomo.mockResolvedValue({ id: 'reg-soetomo' });

      const res = await request(app)
        .post('/soetomo/register')
        .send({
          userId: 'user-1',
          tipePasien: 'JKN',
          nomorIdentitas: '1234567890123', // 13 digits
          tanggalLahir: '2000-01-01',
          asalRujukan: 'Puskesmas A'
        });

      expect(res.statusCode).toBe(201);
    });

    test('POST /soetomo/ambulance/reserve - success', async () => {
      mockCreateAmbulance.mockResolvedValue({ id: 'amb-123' });

      const res = await request(app)
        .post('/soetomo/ambulance/reserve')
        .send({
          userId: 'user-1',
          keluhan: 'Emergency cardiac arrest',
          address: 'Jl. Pemuda No. 10'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.id).toBe('amb-123');
    });

    test('GET /soetomo/ambulance/history/:userId - success', async () => {
      mockFindManyAmbulance.mockResolvedValue([{ id: 'amb-123', address: 'Jl. Pemuda' }]);

      const res = await request(app).get('/soetomo/ambulance/history/user-1');
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
    });
  });

  describe('RSUD Haji Jatim', () => {
    test('GET /haji-jatim/rooms - success', async () => {
      mockGet.mockResolvedValueOnce({ data: [] });
      const res = await request(app).get('/haji-jatim/rooms');
      expect(res.statusCode).toBe(200);
    });

    test('POST /haji-jatim/register - success NON_JKN', async () => {
      mockCreateHaji.mockResolvedValue({ id: 'reg-haji' });
      const res = await request(app)
        .post('/haji-jatim/register')
        .send({
          userId: 'user-1',
          tipePasien: 'NON_JKN',
          nomorIdentitas: '123456789',
          tanggalLahir: '1995-05-05'
        });
      expect(res.statusCode).toBe(201);
    });
  });

  describe('RSUD Karsa Husada', () => {
    test('GET /karsahusada/rooms - success', async () => {
      mockGet.mockResolvedValueOnce({ data: [] });
      const res = await request(app).get('/karsahusada/rooms');
      expect(res.statusCode).toBe(200);
    });
  });

  describe('RSUD Saiful Anwar', () => {
    test('GET /saiful-anwar/rooms - success', async () => {
      mockGet.mockResolvedValueOnce({ data: [] });
      const res = await request(app).get('/saiful-anwar/rooms');
      expect(res.statusCode).toBe(200);
    });
  });
});
