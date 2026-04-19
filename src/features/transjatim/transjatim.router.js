import { Router } from 'express';
import * as TransJatimController from './transjatim.controller.js';

const router = Router();

// Endpoint Agregasi (Utama)
router.get('/summary', TransJatimController.getSummary);

// Endpoint Individual (Jika frontend hanya butuh salah satu)
router.get('/tarif', TransJatimController.getTarif);
router.get('/rute', TransJatimController.getRute);
router.get('/bus-stops', TransJatimController.getBusStopsByKoridor);

export default router;