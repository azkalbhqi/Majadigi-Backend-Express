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
  return await prisma.pendaftaranKarsahusada.create({
    data,
  });
};

export const getRegistrationHistory = async (userId) => {
  return await prisma.pendaftaranKarsahusada.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};
