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
  return await prisma.pendaftaranSoetomo.create({
    data,
  });
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
