import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Define mocks for Prisma database queries
const mockCount = jest.fn();
const mockGroupBy = jest.fn();
const mockFindMany = jest.fn();
const mockQueryRaw = jest.fn();

jest.unstable_mockModule('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => {
      return {
        $queryRaw: mockQueryRaw,
        user: { count: mockCount },
        activity: { count: mockCount, groupBy: mockGroupBy },
        skriningTbc: { count: mockCount, groupBy: mockGroupBy, findMany: mockFindMany },
        pendaftaranAmbulansSoetomo: { count: mockCount, findMany: mockFindMany },
        pendaftaranSoetomo: { count: mockCount },
        pendaftaranHajiJatim: { count: mockCount },
        pendaftaranKarsahusada: { count: mockCount },
        pendaftaranSaifulAnwar: { count: mockCount },
        pendaftaranDahaHusada: { count: mockCount }
      };
    })
  };
});

jest.unstable_mockModule('../../src/config/prisma.js', () => {
  return {
    __esModule: true,
    default: {
      $queryRaw: mockQueryRaw,
      user: { count: mockCount },
      activity: { count: mockCount, groupBy: mockGroupBy },
      skriningTbc: { count: mockCount, groupBy: mockGroupBy, findMany: mockFindMany },
      pendaftaranAmbulansSoetomo: { count: mockCount, findMany: mockFindMany },
      pendaftaranSoetomo: { count: mockCount },
      pendaftaranHajiJatim: { count: mockCount },
      pendaftaranKarsahusada: { count: mockCount },
      pendaftaranSaifulAnwar: { count: mockCount },
      pendaftaranDahaHusada: { count: mockCount }
    }
  };
});

// Mock Axios for service status checks
const mockGet = jest.fn();
jest.unstable_mockModule('axios', () => {
  return {
    __esModule: true,
    default: {
      get: mockGet
    }
  };
});

// Dynamic imports
const { default: request } = await import('supertest');
const { default: app } = await import('../../src/app.js');
const { generateToken } = await import('../../src/features/auth/auth.utils.js');

describe('Monitoring Feature Tests', () => {
  let adminToken;
  let patientToken;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Generate mock tokens
    adminToken = 'Bearer ' + generateToken({ userId: '3201011234567899', email: 'admin@majadigi.gov', role: 'ADMIN' });
    patientToken = 'Bearer ' + generateToken({ userId: '3201011234567800', email: 'patient@majadigi.gov', role: 'PATIENT' });
    
    // Default mocks
    mockQueryRaw.mockResolvedValue([1]);
    mockCount.mockResolvedValue(10);
    mockGroupBy.mockImplementation((args) => {
      if (args && args.by) {
        if (args.by.includes('screeningResult')) {
          return Promise.resolve([
            { screeningResult: 'LOW', _count: { id: 8 } },
            { screeningResult: 'HIGH', _count: { id: 2 } }
          ]);
        }
        if (args.by.includes('feature')) {
          return Promise.resolve([
            { feature: 'TransJatim', _count: { id: 5 } }
          ]);
        }
        if (args.by.includes('userId')) {
          return Promise.resolve([
            { userId: '123', _count: { id: 1 } }
          ]);
        }
      }
      return Promise.resolve([]);
    });
    mockFindMany.mockResolvedValue([]);
    mockGet.mockResolvedValue({ status: 200, data: { success: true } });
  });

  describe('Security & Authorization', () => {
    test('should block requests without access token', async () => {
      const res = await request(app).get('/monitoring/summary');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('missing or invalid');
    });

    test('should block non-admin users', async () => {
      const res = await request(app)
        .get('/monitoring/summary')
        .set('Authorization', patientToken);
      
      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Admin role required');
    });

    test('should allow authenticated admin requests', async () => {
      const res = await request(app)
        .get('/monitoring/summary')
        .set('Authorization', adminToken);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('should allow bypass in test environment via query parameter', async () => {
      const res = await request(app)
        .get('/monitoring/summary')
        .query({ bypassAuth: 'true' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Endpoints functionality', () => {
    test('GET /monitoring/summary - success format', async () => {
      const res = await request(app)
        .get('/monitoring/summary')
        .set('Authorization', adminToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.traffic).toBeDefined();
      expect(res.body.data.services).toBeDefined();
      expect(res.body.data.system).toBeDefined();
      expect(res.body.data.database).toBeDefined();
    });

    test('GET /monitoring/traffic - returns traffic window data', async () => {
      // Trigger a dummy request first to record some traffic in interceptor
      await request(app).get('/opendata/datasets').query({ bypassAuth: 'true' });

      const res = await request(app)
        .get('/monitoring/traffic')
        .set('Authorization', adminToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.aggregated).toBeDefined();
      expect(res.body.data.aggregated.totalRequests).toBeGreaterThanOrEqual(1);
      expect(res.body.data.recentLogs.length).toBeGreaterThanOrEqual(1);
    });

    test('GET /monitoring/services - returns living check list', async () => {
      mockGet.mockRejectedValueOnce(new Error('Connection failure')); // First external ping fails
      
      const res = await request(app)
        .get('/monitoring/services')
        .set('Authorization', adminToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(4); // DB + 3 external services
      
      const dbStatus = res.body.data.find(s => s.name.includes('Database'));
      expect(dbStatus.status).toBe('UP');

      const failedService = res.body.data.find(s => s.name === 'Jatim Open Data API');
      expect(failedService.status).toBe('DOWN');
    });

    test('GET /monitoring/system - returns platform detail logs', async () => {
      const res = await request(app)
        .get('/monitoring/system')
        .set('Authorization', adminToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.os).toBeDefined();
      expect(res.body.data.process).toBeDefined();
    });

    test('GET /monitoring/admin-metrics - gathers stats aggregates', async () => {
      const res = await request(app)
        .get('/monitoring/admin-metrics')
        .set('Authorization', adminToken);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.users).toBeDefined();
      expect(res.body.data.users.total).toBe(10);
      expect(res.body.data.tbcScreening.results.LOW).toBe(8);
      expect(res.body.data.tbcScreening.results.HIGH).toBe(2);
      expect(res.body.data.hospitalRegistrations.totalAll).toBe(50); // 5 models * count of 10
    });

    test('POST /monitoring/traffic/clear - resets metrics', async () => {
      // Track some traffic
      await request(app).get('/opendata/datasets').query({ bypassAuth: 'true' });

      // Reset
      const clearRes = await request(app)
        .post('/monitoring/traffic/clear')
        .set('Authorization', adminToken);

      expect(clearRes.statusCode).toBe(200);

      // Verify traffic is cleared
      const res = await request(app)
        .get('/monitoring/traffic')
        .set('Authorization', adminToken);

      expect(res.body.data.aggregated.totalRequests).toBe(0);
    });
  });
});
