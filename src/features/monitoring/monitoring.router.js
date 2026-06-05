import { Router } from 'express';
import * as controller from './monitoring.controller.js';
import { verifyToken } from '../auth/auth.utils.js';

const router = Router();

/**
 * Middleware to restrict access to Admins only
 */
const requireAdmin = (req, res, next) => {
  // Allow bypassing authentication in local/development environment or if explicitly configured
  const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV || process.env.NODE_ENV === 'test';
  const bypassParam = req.query.bypassAuth === 'true' || req.headers['x-bypass-auth'] === 'true';
  const bypassEnv = process.env.BYPASS_MONITORING_AUTH === 'true';

  if ((isDev && bypassParam) || bypassEnv) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Token is missing or invalid'
    });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired access token'
    });
  }

  if (decoded.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Admin role required'
    });
  }

  req.user = decoded;
  next();
};

// Monitoring Endpoints
router.get('/summary', requireAdmin, controller.getSummary);
router.get('/traffic', requireAdmin, controller.getTraffic);
router.get('/services', requireAdmin, controller.getServices);
router.get('/system', requireAdmin, controller.getSystem);
router.get('/admin-metrics', requireAdmin, controller.getAdminMetrics);
router.post('/traffic/clear', requireAdmin, controller.clearTraffic);

export default router;
