import prisma from '../../config/prisma.js';
import axios from 'axios';

export const QUESTIONS = [
  {
    id: "q1",
    text: "Apakah Anda mengalami batuk berkepanjangan (berdahak maupun kering) selama 2 minggu atau lebih?",
    weight: 3,
    category: "Gejala Utama"
  },
  {
    id: "q2",
    text: "Apakah Anda pernah batuk mengeluarkan darah atau dahak bercampur darah?",
    weight: 4,
    category: "Gejala Utama"
  },
  {
    id: "q3",
    text: "Apakah Anda mengalami demam atau meriang lebih dari 2 minggu yang hilang timbul?",
    weight: 2,
    category: "Gejala Tambahan"
  },
  {
    id: "q4",
    text: "Apakah Anda sering berkeringat berlebih di malam hari tanpa melakukan aktivitas fisik?",
    weight: 2,
    category: "Gejala Tambahan"
  },
  {
    id: "q5",
    text: "Apakah berat badan Anda turun secara drastis dalam 1-2 bulan terakhir tanpa sebab yang jelas?",
    weight: 2,
    category: "Gejala Tambahan"
  },
  {
    id: "q6",
    text: "Apakah nafsu makan Anda menurun drastis dalam beberapa minggu terakhir?",
    weight: 1,
    category: "Gejala Tambahan"
  },
  {
    id: "q7",
    text: "Apakah Anda sering merasakan sesak napas atau nyeri dada saat bernapas atau batuk?",
    weight: 2,
    category: "Gejala Tambahan"
  },
  {
    id: "q8",
    text: "Apakah tubuh Anda sering terasa lemas, letih, lesu, dan mudah lelah meskipun sudah cukup beristirahat?",
    weight: 1,
    category: "Gejala Tambahan"
  },
  {
    id: "q9",
    text: "Apakah Anda pernah atau sedang melakukan kontak erat dengan penderita TBC aktif (keluarga/rekan kerja/tetangga)?",
    weight: 3,
    category: "Faktor Risiko"
  },
  {
    id: "q10",
    text: "Apakah Anda mengalami pembengkakan kelenjar getah bening di area leher, ketiak, atau lipat paha?",
    weight: 2,
    category: "Gejala Tambahan"
  }
];

/**
 * Returns the list of screening questions.
 */
export const getQuestions = async () => {
  return QUESTIONS;
};

/**
 * Submits the TBC screening, calculates the score/result, and saves to the database.
 */
export const submitScreening = async (userId, answers) => {
  // 1. Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // 2. Validate answers parameter
  if (!answers || typeof answers !== 'object') {
    const error = new Error('Answers object is required');
    error.statusCode = 400;
    throw error;
  }

  // 3. Calculate score
  let score = 0;
  QUESTIONS.forEach((q) => {
    if (answers[q.id] === true) {
      score += q.weight;
    }
  });

  // 4. Determine result and recommendation
  let result = "LOW";
  let recommendation = "Potensi TBC Rendah. Tetap jaga kesehatan dan konsultasikan ke dokter jika gejala memburuk.";

  if (score >= 6 && score < 10) {
    result = "MEDIUM";
    recommendation = "Potensi TBC Sedang. Disarankan untuk melakukan pemeriksaan lebih lanjut (seperti tes dahak/Sputum atau Rontgen Dada) di Puskesmas atau Rumah Sakit terdekat.";
  } else if (score >= 10) {
    result = "HIGH";
    recommendation = "Potensi TBC Tinggi. Sangat disarankan untuk segera memeriksakan diri ke dokter atau fasilitas kesehatan terdekat untuk mendapatkan penanganan medis segera.";
  }

  // 5. Save screening record to the database
  const record = await prisma.skriningTbc.create({
    data: {
      userId,
      coughDuration: answers['q1'] === true ? 2 : 0,
      fever: answers['q3'] === true,
      weightLoss: answers['q5'] === true,
      nightSweat: answers['q4'] === true,
      screeningResult: result,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        }
      }
    }
  });

  // 6. Integrate with HealthUser table
  try {
    await prisma.healthUser.upsert({
      where: { userId },
      update: { tbcStatus: result },
      create: { userId, tbcStatus: result },
    });
  } catch (err) {
    console.error('Failed to upsert HealthUser record during TBC screening:', err.message);
  }

  // Log activity
  try {
    await prisma.activity.create({
      data: {
        userId,
        feature: 'Skrining TBC',
        description: `Melakukan Skrining TBC (E-TIBI) - Hasil: Risiko ${result}`
      }
    });
  } catch (err) {
    console.error('Failed to log TBC screening activity:', err.message);
  }

  return {
    id: record.id,
    userId: record.userId,
    userName: record.user.name,
    score: score,
    result: record.screeningResult,
    recommendation,
    answers: answers,
    screeningDate: record.screeningDate
  };
};

/**
 * Retrieves the screening history for a specific user.
 */
export const getScreeningHistory = async (userId) => {
  // 1. Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // 2. Fetch history
  const history = await prisma.skriningTbc.findMany({
    where: { userId },
    orderBy: { screeningDate: 'desc' }
  });

  // Map database columns back to answers and computed score for front-end compatibility
  return history.map(record => {
    let computedScore = 0;
    if (record.coughDuration >= 2) computedScore += 3;
    if (record.fever) computedScore += 2;
    if (record.weightLoss) computedScore += 2;
    if (record.nightSweat) computedScore += 2;

    let recommendation = "Potensi TBC Rendah. Tetap jaga kesehatan dan konsultasikan ke dokter jika gejala memburuk.";
    if (computedScore >= 6 && computedScore < 10) {
      recommendation = "Potensi TBC Sedang. Disarankan untuk melakukan pemeriksaan lebih lanjut (seperti tes dahak/Sputum atau Rontgen Dada) di Puskesmas atau Rumah Sakit terdekat.";
    } else if (computedScore >= 10) {
      recommendation = "Potensi TBC Tinggi. Sangat disarankan untuk segera memeriksakan diri ke dokter atau fasilitas kesehatan terdekat untuk mendapatkan penanganan medis segera.";
    }

    return {
      id: record.id,
      userId: record.userId,
      score: computedScore,
      screeningResult: record.screeningResult,
      screeningDate: record.screeningDate,
      recommendation,
      answers: {
        q1: record.coughDuration >= 2,
        q3: record.fever,
        q4: record.nightSweat,
        q5: record.weightLoss,
      }
    };
  });
};

/**
 * Retrieves the catalog of all hospitals.
 */
export const getAllRumahSakit = async () => {
  return await prisma.rumahSakit.findMany();
};

const HOSPITAL_URL_MAP = {
  'daha-husada': 'rsud-daha-husada',
  'soetomo': 'rsud-dr-soetomo',
  'haji-jatim': 'rsud-haji-prov-jatim',
  'karsahusada': 'rsud-karsa-husada-batu',
  'saiful-anwar': 'rsud-dr.-saiful-anwar'
};

/**
 * Fetches layanan details for a specific hospital path from the external public API.
 */
export const getLayananByHospitalPath = async (hospitalPath) => {
  const dbUrl = HOSPITAL_URL_MAP[hospitalPath];
  if (!dbUrl) {
    return null; // Return null so controller can call next() for fall-through
  }

  try {
    const response = await axios.get(
      `https://api.majadigi.jatimprov.go.id/api/public/layanan/${dbUrl}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching services for ${hospitalPath}:`, error.message);
    const apiError = new Error('Failed to fetch hospital service data');
    apiError.statusCode = error.response?.status || 500;
    throw apiError;
  }
};

export default {
  getQuestions,
  submitScreening,
  getScreeningHistory,
  getAllRumahSakit,
  getLayananByHospitalPath
};
