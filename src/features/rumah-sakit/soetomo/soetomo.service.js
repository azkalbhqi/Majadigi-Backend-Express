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
