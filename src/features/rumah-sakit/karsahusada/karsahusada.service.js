import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getRooms = async () => {
  try {
    const response = await axios.get(
      'https://api-splp.layanan.go.id/t/jatimprov.go.id/rsukarsahusadabatu/simrs/v1/rooms',
      {
        headers: {
          'Accept': 'application/json',
          'Apikey': `${process.env.API_KEY_RS_KARSA_HUSADA}`
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

  const registration = await prisma.pendaftaranKarsahusada.create({
    data: registrationData,
  });

  try {
    const rs = await prisma.rumahSakit.findFirst({
      where: { url: { contains: 'karsa' } }
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
        description: 'Mendaftar antrian di RSUD Karsa Husada Batu',
      },
    });
  } catch (err) {
    console.error('Karsa Husada registration integration error:', err.message);
  }

  return registration;
};

export const getRegistrationHistory = async (userId) => {
  return await prisma.pendaftaranKarsahusada.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};
