import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getRooms = async () => {
  try {
    const response = await axios.get(
      'https://api-splp.layanan.go.id/t/jatimprov.go.id/kominfo/transformer/v1/rshaji/room-occupancy',
      {
        headers: {
          'Accept': 'application/json',
          'Apikey': `${process.env.API_KEY_RS_HAJI_PROV_JATIM}`
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching room data:', error.message);
    throw new Error('Failed to fetch data from SPLP Service');
  }
};



export const registerPasien = async (data) => {
  const { dokter, keluhan, ...registrationData } = data;

  const registration = await prisma.pendaftaranHajiJatim.create({
    data: registrationData,
  });

  try {
    const rs = await prisma.rumahSakit.findFirst({
      where: { url: { contains: 'haji' } }
    });
    if (rs) {
      await prisma.medicalRecord.create({
        data: {
          userId: registrationData.userId,
          rumahSakitId: rs.id,
          dokter: dokter || 'dr. Umum (Poli Umum)',
          keluhan: keluhan || 'Pendaftaran online Rumah Sakit',
        }
      });
    }

    if (registrationData.tipePasien === 'JKN' && registrationData.nomorIdentitas) {
      await prisma.healthUser.upsert({
        where: { userId: registrationData.userId },
        update: { noBpjs: registrationData.nomorIdentitas },
        create: { userId: registrationData.userId, noBpjs: registrationData.nomorIdentitas },
      });
    }

    // Log activity
    await prisma.activity.create({
      data: {
        userId: registrationData.userId,
        feature: 'Pendaftaran Antrian',
        description: 'Mendaftar antrian di RSU Haji Surabaya',
      },
    });
  } catch (err) {
    console.error('Haji registration integration error:', err.message);
  }

  return registration;
};

export const getRegistrationHistory = async (userId) => {
  return await prisma.pendaftaranHajiJatim.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};
