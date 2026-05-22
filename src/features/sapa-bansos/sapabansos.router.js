import { Router } from 'express';
import * as SapaBansosController from './sapabansos.controller.js';

const router = Router();

router.get('/user/:userID', SapaBansosController.checkBansos);

export default router;
