import * as service from './monitoring.service.js';

/**
 * Endpoint: GET /monitoring/summary
 * Returns high-level dashboard summaries of traffic, system health, external services, and DB metrics
 */
export const getSummary = async (req, res) => {
  try {
    const traffic = service.getTrafficMetrics();
    const system = service.getSystemHealth();
    const services = await service.getServiceStatus();
    
    // Quick summary of database metrics
    let dbSummary = { totalUsers: 0, totalActivities: 0 };
    try {
      const metrics = await service.getAdminMetrics();
      dbSummary.totalUsers = metrics.users.total;
      dbSummary.totalActivities = metrics.activities.total;
    } catch (e) {
      console.warn('Could not load DB metrics for summary:', e.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Monitoring summary fetched successfully',
      data: {
        traffic: {
          totalRequests: traffic.aggregated.totalRequests,
          errorRate: traffic.aggregated.errorRate,
          averageLatencyMs: traffic.aggregated.latency.avg
        },
        services: services.map(s => ({ name: s.name, status: s.status, latencyMs: s.latencyMs })),
        system: {
          cpuLoadPercent: system.os.loadAverage[0], // 1 min load average
          memoryUsagePercent: system.os.memoryUsagePercent,
          uptime: system.process.uptime
        },
        database: dbSummary
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch monitoring summary: ' + error.message
    });
  }
};

/**
 * Endpoint: GET /monitoring/traffic
 * Returns detailed traffic logs and endpoint/method analytics
 */
export const getTraffic = (req, res) => {
  try {
    const traffic = service.getTrafficMetrics();
    return res.status(200).json({
      success: true,
      message: 'Traffic details fetched successfully',
      data: traffic
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch traffic metrics: ' + error.message
    });
  }
};

/**
 * Endpoint: GET /monitoring/services
 * Performs live pings and returns detailed connection checks for DB and external APIs
 */
export const getServices = async (req, res) => {
  try {
    const services = await service.getServiceStatus();
    return res.status(200).json({
      success: true,
      message: 'Services health status fetched successfully',
      data: services
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch services status: ' + error.message
    });
  }
};

/**
 * Endpoint: GET /monitoring/system
 * Returns detailed system (OS & Node.js process) resources status
 */
export const getSystem = (req, res) => {
  try {
    const system = service.getSystemHealth();
    return res.status(200).json({
      success: true,
      message: 'System resource health fetched successfully',
      data: system
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch system metrics: ' + error.message
    });
  }
};

/**
 * Endpoint: GET /monitoring/admin-metrics
 * Returns database aggregate statistics on users, screenings, ambulance, and hospital registrations
 */
export const getAdminMetrics = async (req, res) => {
  try {
    const metrics = await service.getAdminMetrics();
    return res.status(200).json({
      success: true,
      message: 'Admin metrics fetched successfully',
      data: metrics
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch admin metrics: ' + error.message
    });
  }
};

/**
 * Endpoint: POST /monitoring/traffic/clear
 * Resets traffic logging and analytics stats
 */
export const clearTraffic = (req, res) => {
  try {
    service.resetTrafficStats();
    return res.status(200).json({
      success: true,
      message: 'Traffic metrics reset successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to clear traffic metrics: ' + error.message
    });
  }
};
