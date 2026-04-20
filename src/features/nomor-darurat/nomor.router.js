import { Router } from 'express';
import * as NomorController from './nomor.controller.js';
const router = Router();

// Define your mobile API endpoints
router.get('/', NomorController.getEmergencyNumbers);
router.get('/cities', NomorController.getCities);

export default router;