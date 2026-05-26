import prisma from '../../config/prisma.js';

/**
 * Fetch all layanan records from the database.
 * @returns {Promise<Array>} Array of layanan objects
 */
const getAllLayanan = async () => {
  return prisma.layanan.findMany({
    orderBy: { id: 'asc' },
  });
};

export default { getAllLayanan };
