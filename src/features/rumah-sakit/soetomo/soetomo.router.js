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

export default router;