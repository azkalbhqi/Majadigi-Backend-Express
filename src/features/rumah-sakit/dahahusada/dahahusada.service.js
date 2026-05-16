import axios from 'axios';

export const getDahaHusadaRooms = async () => {
  try {
    const response = await axios.get(
      'https://api-splp.layanan.go.id/t/jatimprov.go.id/kominfo/transformer/v1/rsud-daha-husada/rooms',
      {
        headers: {
          'Accept': 'application/json',
          'Apikey': `${process.env.API_KEY_RS_DAHA_HUSADA}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching room data:', error.message);
    throw new Error('Failed to fetch data from SPLP Service');
  }
};

// ==============================
// GET POLYCLINICS
// ==============================
export const getPolyclinics = async () => {
  try {
    const response = await axios.get(
      'https://api-splp.layanan.go.id/t/jatimprov.go.id/kominfo/transformer/v1/rsud-daha-husada/master/polychlinic',
      {
        headers: {
          'Accept': 'application/json',
          'Apikey': `${process.env.API_KEY_RS_DAHA_HUSADA}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching polyclinics:', error.message);
    throw new Error('Failed to fetch polyclinics data');
  }
};



// ==============================
// GET SURGERY SCHEDULE
// ==============================
export const getSurgerySchedule = async ({
  page = 1,
  limit = 3,
  startDate,
  endDate,
  poliId,
}) => {
  try {
    const response = await axios.get(
      'https://api-splp.layanan.go.id/t/jatimprov.go.id/kominfo/transformer/v1/rsud-daha-husada/schedule/surgery',
      {
        params: {
          page,
          limit,
          'date[gte]': startDate,
          'date[lte]': endDate,
          'poli_name[eq]': poliId,
        },
        headers: {
          'Accept': 'application/json',
          'Apikey': `${process.env.API_KEY_RS_DAHA_HUSADA}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching surgery schedule:', error.message);
    throw new Error('Failed to fetch surgery schedule');
  }
};

// ==============================
// GET POLYCLINIC DOCTORS
// ==============================
export const getPolyDoctor = async (polyclinicId) => {
  try {
    const response = await axios.get(
      `https://api-splp.layanan.go.id/t/jatimprov.go.id/kominfo/transformer/v1/rsud-daha-husada/master/polychlinic/${polyclinicId}/doctor`,
      {
        headers: {
          'Accept': 'application/json',
          'Apikey': `${process.env.API_KEY_RS_DAHA_HUSADA}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching polyclinic doctors:', error.message);
    throw new Error('Failed to fetch polyclinic doctors data');
  }
};

// ==============================
// GET DOCTOR QUEUE
// ==============================
export const getDoctorQueue = async (polyclinicId, doctorId) => {
  try {
    const response = await axios.get(
      `https://api-splp.layanan.go.id/t/jatimprov.go.id/kominfo/transformer/v1/rsud-daha-husada/queue/polychlinic/${polyclinicId}/doctor/${doctorId}`,
      {
        headers: {
          'Accept': 'application/json',
          'Apikey': `${process.env.API_KEY_RS_DAHA_HUSADA}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching doctor queue:', error.message);
    throw new Error('Failed to fetch doctor queue data');
  }
};

export const registerPasien = async (data) => {
  return await prisma.pendaftaranDahaHusada.create({
    data,
  });
};

export const getRegistrationHistory = async (userId) => {
  return await prisma.pendaftaranDahaHusada.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};
