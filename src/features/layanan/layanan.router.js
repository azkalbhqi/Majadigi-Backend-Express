import { Router } from 'express';
import * as Controller from './layanan.controller.js';

const router = Router();

// GET /layanan/integrated — returns all layanan records
router.get('/integrated', Controller.getIntegratedLayanan);

export default router;
