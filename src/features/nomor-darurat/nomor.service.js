import axios from 'axios';

const BASE_URL = 'https://api.majadigi.jatimprov.go.id/api/public';

export const fetchCities = async () => {
    const { data } = await axios.get(`${BASE_URL}/kab-kota`);
    return data.data; 
};

export const fetchEmergencyNumbers = async (cityId) => {
    const { data } = await axios.get(`${BASE_URL}/nomor-darurat`, {
        params: { kab_kota_id: cityId }
    });
    return data.data;
};

export const fetchDefaultEmergencyNumbers = async () => {
    const { data } = await axios.get(`${BASE_URL}/nomor-darurat`);
    return data.data;
}

export default { fetchCities, fetchEmergencyNumbers, fetchDefaultEmergencyNumbers };