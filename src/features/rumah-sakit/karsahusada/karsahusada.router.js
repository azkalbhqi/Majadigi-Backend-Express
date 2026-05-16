// routes/soetomo.routes.js

import { Router } from 'express';
import * as KarsahusadaController from './karsahusada.controller.js';

const router = Router();

// GET ROOMS
router.get('/rooms', KarsahusadaController.getRooms);

// POST REGISTER
router.post('/register', KarsahusadaController.register);

// GET REGISTRATION HISTORY
router.get('/history/:userId', KarsahusadaController.getHistory);

export default router;