// routes/soetomo.routes.js

import { Router } from 'express';
import * as SoetomoController from './soetomo.controller.js';

const router = Router();

// GET ROOMS
router.get('/rooms', SoetomoController.getRooms);

// POST REGISTER
router.post('/register', SoetomoController.register);

// GET REGISTRATION HISTORY
router.get('/history/:userId', SoetomoController.getHistory);

// POST AMBULANCE RESERVATION
router.post('/ambulance/reserve', SoetomoController.reserveAmbulance);

// GET AMBULANCE HISTORY
router.get('/ambulance/history/:userId', SoetomoController.getAmbulanceHistory);

export default router;