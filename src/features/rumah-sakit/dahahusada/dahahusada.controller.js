// controllers/dahahusada.controller.js

import * as service from './dahahusada.service.js';

// GET ROOMS
export const getRooms = async (req, res) => {
  try {
    const roomData = await service.getDahaHusadaRooms();

    res.status(200).json(roomData);
  } catch (error) {
    res.status(500).json({
      message: error.message,
      statusCode: 500,
    });
  }
};

// GET POLYCLINICS
export const getPolyclinics = async (req, res) => {
  try {
    const polyclinicData = await service.getPolyclinics();

    res.status(200).json(polyclinicData);
  } catch (error) {
    res.status(500).json({
      message: error.message,
      statusCode: 500,
    });
  }
};

// GET SURGERY SCHEDULE
export const getSurgerySchedule = async (req, res) => {
  try {
    const {
      page,
      limit,
      startDate,
      endDate,
      poliId,
    } = req.query;

    const surgeryData = await service.getSurgerySchedule({
      page,
      limit,
      startDate,
      endDate,
      poliId,
    });

    res.status(200).json(surgeryData);
  } catch (error) {
    res.status(500).json({
      message: error.message,
      statusCode: 500,
    });
  }
};

// GET POLYCLINIC DOCTORS
export const getPolyDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorsData = await service.getPolyDoctor(id);

    res.status(200).json(doctorsData);
  } catch (error) {
    res.status(500).json({
      message: error.message,
      statusCode: 500,
    });
  }
};

// GET DOCTOR QUEUE
export const getDoctorQueue = async (req, res) => {
  try {
    const { polyclinicId, doctorId } = req.params;
    const queueData = await service.getDoctorQueue(polyclinicId, doctorId);

    res.status(200).json(queueData);
  } catch (error) {
    res.status(500).json({
      message: error.message,
      statusCode: 500,
    });
  }
};

//PENDAFTARAN PASIEN
export const register = async (req, res) => {
  try {
    const { userId, tipePasien, nomorIdentitas, tanggalLahir, asalRujukan, dokter, keluhan } = req.body;

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
      dokter,
      keluhan,
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