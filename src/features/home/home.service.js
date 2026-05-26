import axios from 'axios';

const mapImageUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('api.minio.jatimprov.go.id')) return url;

  // Carousel banners
  if (url.includes('Group%204.jpg')) {
    return 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop';
  }
  if (url.includes('Group%205.jpg')) {
    return 'https://images.unsplash.com/photo-1557683316-973673baf926?w=600&auto=format&fit=crop';
  }
  if (url.includes('Group%206.jpg')) {
    return 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=600&auto=format&fit=crop';
  }

  // Jatim Angka Stats
  if (url.includes('jumlah_penduduk')) {
    return 'https://cdn-icons-png.flaticon.com/512/3588/3588658.png';
  }
  if (url.includes('Pertumbuhan_penduduk')) {
    return 'https://cdn-icons-png.flaticon.com/512/2942/2942247.png';
  }
  if (url.includes('presentase_penduduk_miskin')) {
    return 'https://cdn-icons-png.flaticon.com/512/8437/8437585.png';
  }
  if (url.includes('Keluarga_Penerima_Manfaat')) {
    return 'https://cdn-icons-png.flaticon.com/512/3126/3126111.png';
  }
  if (url.includes('TIngkat_Pengangguran_Terbuka')) {
    return 'https://cdn-icons-png.flaticon.com/512/1436/1436660.png';
  }
  if (url.includes('Jumlah_Sarana_kesehatan')) {
    return 'https://cdn-icons-png.flaticon.com/512/3063/3063176.png';
  }
  if (url.includes('produksi_padi')) {
    return 'https://cdn-icons-png.flaticon.com/512/2271/2271383.png';
  }
  if (url.includes('Luas_Daerah')) {
    return 'https://cdn-icons-png.flaticon.com/512/854/854878.png';
  }

  // Kategori Layanan Daerah
  if (url.includes('Mall_Pelayanan_Publik')) {
    return 'https://cdn-icons-png.flaticon.com/512/2652/2652233.png';
  }
  if (url.includes('Rumah_Sakit')) {
    return 'https://cdn-icons-png.flaticon.com/512/3063/3063176.png';
  }
  if (url.includes('Sekolah_Menengah_Negeri')) {
    return 'https://cdn-icons-png.flaticon.com/512/167/167707.png';
  }

  // Fallback for any other minio URLs
  return 'https://cdn-icons-png.flaticon.com/512/4156/4156943.png';
};

const replaceMinioUrls = (obj) => {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => replaceMinioUrls(item));
  }

  if (typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (key === 'img_url' || key === 'icon' || key === 'iconUrl') {
          newObj[key] = mapImageUrl(obj[key]);
        } else {
          newObj[key] = replaceMinioUrls(obj[key]);
        }
      }
    }
    return newObj;
  }

  return obj;
};

export const getBerandaData = async () => {
  try {
    const response = await axios.get('https://api.majadigi.jatimprov.go.id/api/pages/beranda', {
      headers: { 'Accept': 'application/json' }
    });
    return replaceMinioUrls(response.data);
  } catch (error) {
    console.error('Error fetching beranda data:', error.message);
    throw new Error('Failed to fetch beranda data from SPLP');
  }
};

export const getKategoriLayananDaerah = async () => {
  try {
    const response = await axios.get('https://api.majadigi.jatimprov.go.id/api/public/kategori-layanan-daerah', {
      headers: { 'Accept': 'application/json' }
    });
    return replaceMinioUrls(response.data);
  } catch (error) {
    console.error('Error fetching kategori layanan daerah:', error.message);
    throw new Error('Failed to fetch kategori layanan daerah from SPLP');
  }
};

export const getJatimAngka = async () => {
  try {
    const response = await axios.get('https://api.majadigi.jatimprov.go.id/api/public/jatim-angka', {
      headers: { 'Accept': 'application/json' }
    });
    return replaceMinioUrls(response.data);
  } catch (error) {
    console.error('Error fetching jatim angka:', error.message);
    throw new Error('Failed to fetch jatim angka from SPLP');
  }
};
