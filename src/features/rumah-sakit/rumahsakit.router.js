import { Router } from 'express';
import * as Controller from './rumahsakit.controller.js';

const router = Router();

// TBC Screening routes
router.get('/tbc-screening/questions', Controller.getQuestions);
router.post('/tbc-screening/submit', Controller.submitScreening);
router.get('/tbc-screening/history/:userId', Controller.getHistory);

export default router;
