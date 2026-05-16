// controllers/haji-jatim.controller.js

import * as service from './haji.service.js';

// GET ROOMS
export const getRooms = async (req, res) => {
  try {
    const roomData = await service.getRooms();

    res.status(200).json(roomData);
  } catch (error) {
    res.status(500).json({
      message: error.message,
      statusCode: 500,
    });
  }
};

export const register = async (req, res) => {
  try {
    const { userId, tipePasien, nomorIdentitas, tanggalLahir, asalRujukan } = req.body;

    if (!userId || !tipePasien || !nomorIdentitas || !tanggalLahir) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (tipePasien === 'JKN') {
      if (nomorIdentitas.length !== 13) {
        return res.status(400).json({ message: 'BPJS number must be exactly 13 characters long' });
      }
      if (!asalRujukan) {
        return res.status(400).json({ message: 'asalRujukan is required for JKN patient' });
      }
    } else if (tipePasien === 'NON_JKN') {
      if (nomorIdentitas.length !== 9) {
        return res.status(400).json({ message: 'Medical record number must be exactly 9 characters long' });
      }
    } else {
      return res.status(400).json({ message: 'Invalid tipePasien. Must be JKN or NON_JKN' });
    }

    const data = {
      userId,
      tipePasien,
      nomorIdentitas,
      tanggalLahir: new Date(tanggalLahir),
      asalRujukan: tipePasien === 'JKN' ? asalRujukan : null,
    };

    const result = await service.registerPasien(data);
    res.status(201).json({ message: 'Registration successful', data: result });
  } catch (error) {
    res.status(500).json({ message: error.message, statusCode: 500 });
  }
};

export const getHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await service.getRegistrationHistory(userId);
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: error.message, statusCode: 500 });
  }
};
