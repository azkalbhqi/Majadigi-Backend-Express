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

describe('Open Data Feature Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockOpenDataResponse = {
    data: {
      success: true,
      data: [
        {
          id: 101,
          name: "Jumlah Penduduk Miskin Jawa Timur",
          slug: "jumlah-penduduk-miskin-jawa-timur",
          deskripsi: "<p>Dataset ini berisi data tentang jumlah penduduk miskin di Jatim.</p>",
          topik_id: 1,
          topik_name: "Kependudukan & Catatan Sipil",
          topik_image: "kependudukan.png",
          organisasi_id: 5,
          organisasi_name: "BPS Provinsi Jawa Timur",
          organisasi_image: "bps.png",
          count_view_opendata: 120,
          count_download_opendata: 45,
          satuan: "Jiwa",
          nama_wilayah: "Jawa Timur",
          is_realtime: false,
          cdate: "2023-01-01T00:00:00Z",
          mdate: "2023-06-01T00:00:00Z"
        }
      ]
    }
  };

  test('GET /opendata/datasets - success with cleaning html and mapping properties', async () => {
    mockGet.mockResolvedValueOnce(mockOpenDataResponse);

    const res = await request(app)
      .get('/opendata/datasets')
      .query({ search: 'kemiskinan' });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.length).toBe(1);
    
    const dataset = res.body.data[0];
    expect(dataset.title).toBe("Jumlah Penduduk Miskin Jawa Timur");
    expect(dataset.description).toBe("Dataset ini berisi data tentang jumlah penduduk miskin di Jatim.");
    expect(dataset.topic.name).toBe("Kependudukan & Catatan Sipil");
    expect(dataset.stats.downloads).toBe(45);
  });

  test('GET /opendata/datasets - failure handling', async () => {
    mockGet.mockRejectedValueOnce(new Error('Open Data Server Down'));

    const res = await request(app).get('/opendata/datasets');

    expect(res.statusCode).toBe(500);
    expect(res.body.status).toBe('error');
  });
});
