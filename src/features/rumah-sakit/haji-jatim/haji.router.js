// routes/soetomo.routes.js

import { Router } from 'express';
import * as HajiJatimController from './haji.controller.js';

const router = Router();

// GET ROOMS
router.get('/rooms', HajiJatimController.getRooms);

// POST REGISTER
router.post('/register', HajiJatimController.register);

// GET REGISTRATION HISTORY
router.get('/history/:userId', HajiJatimController.getHistory);

export default router;