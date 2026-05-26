import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getRooms = async () => {
  try {
    const response = await axios.get(
      'https://api.majadigi.jatimprov.go.id/api/external/rsud-soetomo/bed-monitoring',
      {
        headers: {
          'Accept': 'application/json',
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

  const registration = await prisma.pendaftaranSoetomo.create({
    data: registrationData,
  });

  try {
    const rs = await prisma.rumahSakit.findFirst({
      where: { url: { contains: 'soetomo' } }
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
        description: 'Mendaftar antrian di RSUD dr. Soetomo',
      },
    });
  } catch (err) {
    console.error('Soetomo registration integration error:', err.message);
  }

  return registration;
};

export const getRegistrationHistory = async (userId) => {
  return await prisma.pendaftaranSoetomo.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};

export const createAmbulanceReservation = async (data) => {
  const user = await prisma.user.findUnique({
    where: { id: data.userId },
  });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.pendaftaranAmbulansSoetomo.create({
    data,
  });
};

export const getAmbulanceReservationHistory = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return await prisma.pendaftaranAmbulansSoetomo.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};
