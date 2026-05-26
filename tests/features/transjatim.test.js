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

describe('Transjatim Feature Tests', () => {
  const mockTarifResponse = {
    data: {
      success: true,
      data: {
        data: {
          regular: [
            { category: 'Umum', price: 3500 },
            { category: 'Pelajar', price: 1000 }
          ],
          luxury: []
        }
      }
    }
  };

  const mockRuteResponse = {
    data: {
      success: true,
      data: {
        data: [
          {
            kode_koridor: "K1",
            koridor: "JTM1",
            nama_layanan: "Sidoarjo - Surabaya - Gresik",
            color: "#FF0000",
            jam_ops: "05:00 - 21:00",
            routes: "Sidoarjo -> Gresik"
          }
        ]
      }
    }
  };

  const mockBusStopResponse = {
    data: {
      success: true,
      data: {
        data: {
          polyline: "_p~iF~ps|U_c@_@_c@...",
          route: [
            {
              id: "S1",
              name: "Halte Purabaya",
              origin: "Sidoarjo",
              toward: "Gresik",
              latitude: "-7.3512",
              longitude: "112.7243"
            }
          ]
        }
      }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up default URL-based mock implementation
    mockGet.mockImplementation((url) => {
      if (url.includes('/tarif-all')) {
        return Promise.resolve(mockTarifResponse);
      }
      if (url.includes('/rute')) {
        return Promise.resolve(mockRuteResponse);
      }
      if (url.includes('/bus-stop')) {
        return Promise.resolve(mockBusStopResponse);
      }
      return Promise.resolve({ data: {} });
    });
  });

  test('GET /transjatim/tarif - success', async () => {
    const res = await request(app).get('/transjatim/tarif');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.regular).toBeDefined();
    expect(res.body.data.regular[0].price).toBe(3500);
  });

  test('GET /transjatim/rute - success', async () => {
    const res = await request(app).get('/transjatim/rute');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].kode_koridor).toBe("K1");
  });

  test('GET /transjatim/bus-stops - success', async () => {
    const res = await request(app)
      .get('/transjatim/bus-stops')
      .query({ koridor: 'JTM1' });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.stops.length).toBe(1);
    expect(res.body.data.stops[0].name).toBe("Halte Purabaya");
  });

  test('GET /transjatim/summary - success aggregation', async () => {
    const res = await request(app).get('/transjatim/summary');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.metadata.total_corridors).toBe(1);
    expect(res.body.data.corridors[0].map_data.stops[0].name).toBe("Halte Purabaya");
  });
});
