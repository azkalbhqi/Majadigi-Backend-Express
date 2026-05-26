import { Router } from 'express';
import * as HomeController from './home.controller.js';

const router = Router();

router.get('/beranda', HomeController.getBeranda);
router.get('/kategori-layanan-daerah', HomeController.getKategoriLayanan);
router.get('/jatim-angka', HomeController.getJatimAngka);

export default router;
