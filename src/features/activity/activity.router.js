import { Router } from 'express';
import * as controller from './activity.controller.js';

const router = Router();

// Endpoint to log a generic activity
router.post('/', controller.logActivity);

// Endpoint to retrieve a user's activity history
router.get('/:userId', controller.getHistory);

export default router;
