import axios from 'axios';

const BASE_URL = 'https://api.majadigi.jatimprov.go.id/api/external/transjatim';

/**
 * Fetch data tarif mentah
 */
export const fetchTarif = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/tarif-all`);
    return response.data?.data?.data || { regular: [], luxury: [] };
  } catch (error) {
    console.error('Error fetchTarif:', error.message);
    return { regular: [], luxury: [] };
  }
};

/**
 * Fetch data rute/koridor mentah
 */
export const fetchRute = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/rute`);
    return response.data?.data?.data || [];
  } catch (error) {
    console.error('Error fetchRute:', error.message);
    return [];
  }
};

/**
 * Fetch detail bus stop dan polyline berdasarkan nama koridor
 * Digunakan untuk loop di dalam agregasi atau dipanggil mandiri
 */
export const fetchBusStops = async (koridorName) => {
  try {
    const response = await axios.get(`${BASE_URL}/bus-stop`, {
      params: { koridor: koridorName }
    });
    
    const rawData = response.data?.data?.data;
    
    return {
      polyline: rawData?.polyline || "",
      stops: rawData?.route || []
    };
  } catch (error) {
    console.error(`Error fetchBusStops for ${koridorName}:`, error.message);
    return { polyline: "", stops: [] };
  }
};

/**
 * AGREGASI UTAMA: Dashboard-ready data
 * Menggabungkan Tarif + Rute + Bus Stops (Polyline & Halte)
 */
export const getAggregatedTransJatim = async () => {
  try {
    // 1. Ambil data dasar (Tarif dan Daftar Rute) secara paralel
    const [tarif, ruteList] = await Promise.all([
      fetchTarif(),
      fetchRute()
    ]);

    // 2. Ambil detail bus stop untuk SETIAP koridor secara paralel
    // Kita gunakan map dan Promise.all agar fetch-nya efisien
    const corridorsWithDetails = await Promise.all(
      ruteList.map(async (koridor) => {
        const detail = await fetchBusStops(koridor.koridor);
        
        return {
          id: koridor.kode_koridor,
          koridor_code: koridor.koridor, // JTM1, JTM2, dst
          display_name: koridor.nama_layanan,
          color: koridor.color || "#000000",
          operating_hours: koridor.jam_ops,
          routes_overview: koridor.routes,
          map_data: {
            polyline: detail.polyline,
            stops_count: detail.stops.length,
            stops: detail.stops.map(s => ({
              id: s.id,
              name: s.name.trim(),
              origin: s.origin,
              toward: s.toward,
              lat: parseFloat(s.latitude),
              lng: parseFloat(s.longitude)
            }))
          }
        };
      })
    );

    // 3. Susun final object
    return {
      last_updated: new Date().toISOString(),
      metadata: {
        total_corridors: corridorsWithDetails.length,
        total_all_stops: corridorsWithDetails.reduce((acc, curr) => acc + curr.map_data.stops_count, 0)
      },
      corridors: corridorsWithDetails,
      pricing: {
        reguler: tarif.regular,
        luxury: tarif.luxury
      }
    };
  } catch (error) {
    console.error('Critical Error in TransJatim Aggregator:', error.message);
    throw new Error('Gagal melakukan agregasi data Trans Jatim');
  }
};