import { Router } from 'express';
import * as DahaController from './daha.controller.js';

const router = Router();

router.get('/overview', DahaController.getOverview);
router.get('/antrian', DahaController.getAntrian);
router.get('/rooms', DahaController.getRoomStatus);
router.get('/surgery', DahaController.getSurgery);

export default router;