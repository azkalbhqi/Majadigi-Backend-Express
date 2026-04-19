import { Router } from 'express';
import * as OpenDataController from './opendata.controller.js';

const router = Router();

// Endpoint: GET /api/v1/opendata/datasets?search=kemiskinan
router.get('/datasets', OpenDataController.listDatasets);

export default router;