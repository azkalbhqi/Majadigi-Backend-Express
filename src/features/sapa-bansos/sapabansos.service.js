import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// List of mock NIKs from the image
const MOCK_PROFILES = {
  '3201011760371377': {
    name: 'Budi Santoso',
    email: 'budi.santoso@example.com'
  },
  '3201011795352646': {
    name: 'Siti Aminah',
    email: 'siti.aminah@example.com'
  },
  '3201012096455747': {
    name: 'Joko Widodo',
    email: 'joko.widodo@example.com'
  },
  '3201012408683167': {
    name: 'Rini Wulandari',
    email: 'rini.wulandari@example.com'
  },
  '3201012422420709': {
    name: 'Dewi Lestari',
    email: 'dewi.lestari@example.com'
  },
  '3201012600669538': {
    name: 'Ahmad Fauzi',
    email: 'ahmad.fauzi@example.com'
  }
};

const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

/**
 * Calculates the next bansos pickup date (every 25th of the month)
 * If current date is > 25th, it rolls over to 25th of the next month.
 */
export const calculatePickupDate = () => {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();
  const date = now.getDate();

  if (date > 25) {
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
  }

  const targetDate = new Date(year, month, 25);

  const yyyy = targetDate.getFullYear();
  const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
  const dd = String(targetDate.getDate()).padStart(2, '0');

  return {
    isoDate: `${yyyy}-${mm}-${dd}`,
    formattedDate: `25 ${INDONESIAN_MONTHS[month]} ${year}`
  };
};

/**
 * Checks bansos eligibility for a userID (NIK)
 * If found, returns user profile and pickup date.
 * If not, returns not found.
 */
export const checkBansosEligibility = async (userID) => {
  const isEligible = !!MOCK_PROFILES[userID];
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: userID }
    });
    if (dbUser) {
      await prisma.activity.create({
        data: {
          userId: userID,
          feature: 'Sapa Bansos',
          description: `Mengecek kelayakan bansos NIK: ${userID} - Hasil: ${isEligible ? 'Terdaftar' : 'Tidak Terdaftar'}`
        }
      });
    }
  } catch (err) {
    console.error('Failed to log bansos activity check:', err.message);
  }

  if (MOCK_PROFILES[userID]) {
    const profile = MOCK_PROFILES[userID];
    let name = profile.name;
    let email = profile.email;

    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: userID }
      });
      if (dbUser) {
        name = dbUser.name;
        email = dbUser.email;
      }
    } catch (err) {
      console.error('Failed to fetch user from DB in checkBansosEligibility:', err.message);
    }

    const dates = calculatePickupDate();
    return {
      eligible: true,
      data: {
        nik: userID,
        name: name,
        email: email,
        tanggalPengambilan: dates.isoDate,
        tanggalPengambilanFormatted: dates.formattedDate,
        message: 'Selamat! Anda terdaftar sebagai penerima bansos.'
      }
    };
  }

  return {
    eligible: false,
    message: 'Kamu tidak terdaftar pada penerima bansos'
  };
};
