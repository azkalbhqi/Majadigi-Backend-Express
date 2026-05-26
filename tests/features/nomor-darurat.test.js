import { jest, describe, test, expect, beforeEach } from '@jest/globals';

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
const { default: axios } = await import('axios');

describe('Emergency Numbers Feature Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockCitiesResponse = {
    data: {
      data: [
        { id: 1, name: "Kota Surabaya" },
        { id: 2, name: "Kab. Sidoarjo" }
      ]
    }
  };

  const mockNumbersResponse = {
    data: {
      data: [
        { id: 10, name: "Ambulance", number: "118" },
        { id: 11, name: "Polisi", number: "110" }
      ]
    }
  };

  test('GET /nomor-darurat/cities - success', async () => {
    mockGet.mockResolvedValueOnce(mockCitiesResponse);

    const res = await request(app).get('/nomor-darurat/cities');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data[0].name).toBe("Kota Surabaya");
  });

  test('GET /nomor-darurat/ - success (default numbers)', async () => {
    mockGet.mockResolvedValueOnce(mockNumbersResponse);

    const res = await request(app).get('/nomor-darurat');

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data[0].name).toBe("Ambulance");
  });

  test('GET /nomor-darurat/ - success with cityId', async () => {
    mockGet.mockResolvedValueOnce(mockNumbersResponse);

    const res = await request(app)
      .get('/nomor-darurat')
      .query({ cityId: '1' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
  });
});
