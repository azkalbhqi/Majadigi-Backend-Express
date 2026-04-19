import axios from 'axios';

const OPEN_DATA_BASE_URL = 'https://opendata.jatimprov.go.id/api';

export const getDatasets = async (searchKeyword = '') => {
  try {
    const response = await axios.get(`${OPEN_DATA_BASE_URL}/datasets`, {
      params: { search: searchKeyword }
    });

    const rawData = response.data?.data || [];

    // Data Cleaning: Mengambil field krusial saja
    return rawData.map(item => ({
      id: item.id,
      title: item.name,
      slug: item.slug,
      // Membersihkan deskripsi dari tag HTML jika ada
      description: item.deskripsi?.replace(/<[^>]*>?/gm, '') || "",
      topic: {
        id: item.topik_id,
        name: item.topik_name,
        icon: item.topik_image
      },
      organization: {
        id: item.organisasi_id,
        name: item.organisasi_name,
        image: item.organisasi_image
      },
      stats: {
        views: item.count_view_opendata,
        downloads: item.count_download_opendata
      },
      metadata: {
        unit: item.satuan,
        wilayah: item.nama_wilayah,
        is_realtime: item.is_realtime,
        created_at: item.cdate,
        modified_at: item.mdate
      }
    }));
  } catch (error) {
    console.error('OpenData Service Error:', error.message);
    throw new Error('Gagal mengambil dataset dari Open Data Jatim');
  }
};