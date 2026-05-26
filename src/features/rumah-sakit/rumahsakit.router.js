import { Router } from 'express';
import * as Controller from './rumahsakit.controller.js';

import dahaHusadaRouter from './dahahusada/dahahusada.router.js';
import soetomoRouter from './soetomo/soetomo.router.js';
import hajiJatimRouter from './haji-jatim/haji.router.js';
import karsahusadaRouter from './karsahusada/karsahusada.router.js';
import saifulanwarRouter from './saifulanwar/saifulanwar.router.js';

const router = Router();

// Catalog route
router.get('/', Controller.getAllRumahSakit);

// Hospital layanan route
router.get('/:hospitalPath', Controller.getLayananByHospitalPath);

// TBC Screening routes
router.get('/tbc-screening/questions', Controller.getQuestions);
router.post('/tbc-screening/submit', Controller.submitScreening);
router.get('/tbc-screening/history/:userId', Controller.getHistory);

// Individual hospital routes
router.use('/daha-husada', dahaHusadaRouter);
router.use('/soetomo', soetomoRouter);
router.use('/haji-jatim', hajiJatimRouter);
router.use('/karsahusada', karsahusadaRouter);
router.use('/saiful-anwar', saifulanwarRouter);

export default router;
