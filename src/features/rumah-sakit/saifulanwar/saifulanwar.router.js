// routes/saifulanwar.routes.js

import { Router } from 'express';
import * as SaifulAnwarController from './saifulanwar.controller.js';

const router = Router();

// GET ROOMS
router.get('/rooms', SaifulAnwarController.getRooms);

// POST REGISTER
router.post('/register', SaifulAnwarController.register);

// GET REGISTRATION HISTORY
router.get('/history/:userId', SaifulAnwarController.getHistory);

export default router;