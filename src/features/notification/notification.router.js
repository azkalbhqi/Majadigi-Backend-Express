import { Router } from 'express';
import * as controller from './notification.controller.js';

const router = Router();

// Endpoint to retrieve a user's notifications
router.get('/:userId', controller.getNotifications);

// Endpoint to create a new notification (for testing or admin use)
router.post('/', controller.createNotification);

export default router;
