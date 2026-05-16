// routes/dahahusada.routes.js

import { Router } from 'express';
import * as DahaController from './dahahusada.controller.js';

const router = Router();

// GET ROOMS
router.get('/rooms', DahaController.getRooms);

// GET POLYCLINICS
router.get('/polyclinics', DahaController.getPolyclinics);

// GET SURGERY SCHEDULE
router.get('/surgery-schedule', DahaController.getSurgerySchedule);

// GET POLYCLINIC DOCTORS
router.get('/:id/doctor', DahaController.getPolyDoctor);

// GET DOCTOR QUEUE
router.get('/queue/:polyclinicId/doctor/:doctorId', DahaController.getDoctorQueue);

// POST REGISTER
router.post('/register', DahaController.register);

// GET REGISTRATION HISTORY
router.get('/history/:userId', DahaController.getHistory);

export default router;