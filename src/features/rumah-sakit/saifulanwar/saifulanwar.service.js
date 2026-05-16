import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getRooms = async () => {
  try {
    const response = await axios.get(
      'https://api-splp.layanan.go.id/t/jatimprov.go.id/rssa/rooms/v1/',
      {
        headers: {
          'Accept': 'application/json',
          'Apikey': `${process.env.API_KEY_RS_SAIFUL_ANWAR}`
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
  return await prisma.pendaftaranSaifulAnwar.create({
    data,
  });
};

export const getRegistrationHistory = async (userId) => {
  return await prisma.pendaftaranSaifulAnwar.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};
