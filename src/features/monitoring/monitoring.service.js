import os from 'os';
import axios from 'axios';
import { performance } from 'perf_hooks';
import prisma from '../../config/prisma.js';
import { getAggregatedStats, getRequestLogs, clearStats as clearTrafficStats } from './monitoring.middleware.js';

/**
 * Gets traffic metrics from the in-memory middleware tracker
 */
export const getTrafficMetrics = () => {
  return {
    aggregated: getAggregatedStats(),
    recentLogs: getRequestLogs(100)
  };
};

/**
 * Gets system and process health metrics
 */
export const getSystemHealth = () => {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memoryUsagePercent = parseFloat(((usedMem / totalMem) * 100).toFixed(2));
  
  const cpus = os.cpus();
  const cpuModel = cpus.length > 0 ? cpus[0].model : 'Unknown';
  
  return {
    os: {
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
      hostname: os.hostname(),
      uptime: os.uptime(), // system uptime in seconds
      totalMemoryBytes: totalMem,
      freeMemoryBytes: freeMem,
      usedMemoryBytes: usedMem,
      memoryUsagePercent,
      cpuModel,
      cpuCores: cpus.length,
      loadAverage: os.loadavg() // [1 min, 5 min, 15 min]
    },
    process: {
      pid: process.pid,
      nodeVersion: process.version,
      uptime: process.uptime(), // process uptime in seconds
      memoryUsage: process.memoryUsage() // rss, heapTotal, heapUsed, external, arrayBuffers
    }
  };
};

/**
 * Helper to ping an external URL with a timeout
 */
const pingService = async (name, url) => {
  const start = performance.now();
  try {
    const res = await axios.get(url, { 
      timeout: 3000,
      headers: { 'User-Agent': 'Majadigi-Monitoring-Service/1.0' }
    });
    const latency = parseFloat((performance.now() - start).toFixed(2));
    return {
      name,
      url,
      status: 'UP',
      statusCode: res.status,
      latencyMs: latency
    };
  } catch (error) {
    const latency = parseFloat((performance.now() - start).toFixed(2));
    return {
      name,
      url,
      status: error.code === 'ECONNABORTED' ? 'TIMEOUT' : 'DOWN',
      statusCode: error.response?.status || null,
      latencyMs: latency,
      error: error.message
    };
  }
};

/**
 * Performs health checks on the database and external API services
 */
export const getServiceStatus = async () => {
  // 1. Database Health Check
  let dbStatus = { name: 'Database (PostgreSQL)', url: 'Prisma Connection', status: 'DOWN', latencyMs: 0 };
  const dbStart = performance.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus.status = 'UP';
    dbStatus.latencyMs = parseFloat((performance.now() - dbStart).toFixed(2));
  } catch (error) {
    dbStatus.status = 'DOWN';
    dbStatus.error = error.message;
    dbStatus.latencyMs = parseFloat((performance.now() - dbStart).toFixed(2));
  }

  // 2. External Services
  const services = await Promise.all([
    pingService('Jatim Open Data API', 'https://opendata.jatimprov.go.id/api/datasets'),
    pingService('TransJatim Public Transit API', 'https://api.majadigi.jatimprov.go.id/api/external/transjatim/rute'),
    pingService('Hospital Public Services API', 'https://api.majadigi.jatimprov.go.id/api/public/layanan/rsud-dr-soetomo')
  ]);

  return [dbStatus, ...services];
};

/**
 * Aggregates admin statistics from the PostgreSQL database
 */
export const getAdminMetrics = async () => {
  try {
    const now = new Date();
    const past24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const past7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const past30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 1. User metrics
    const totalUsers = await prisma.user.count();
    const newUsers24h = await prisma.user.count({ where: { createdAt: { gte: past24h } } });
    const newUsers7d = await prisma.user.count({ where: { createdAt: { gte: past7d } } });
    const newUsers30d = await prisma.user.count({ where: { createdAt: { gte: past30d } } });
    
    // Active users: unique user IDs in Activity table in last 24h & 7d
    const activeUsers24h = await prisma.activity.groupBy({
      by: ['userId'],
      where: { createdAt: { gte: past24h } },
      _count: true
    }).then(res => res.length);

    const activeUsers7d = await prisma.activity.groupBy({
      by: ['userId'],
      where: { createdAt: { gte: past7d } },
      _count: true
    }).then(res => res.length);

    // 2. Activity metrics
    const totalActivities = await prisma.activity.count();
    const featureStatsRaw = await prisma.activity.groupBy({
      by: ['feature'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    });
    const featureStats = featureStatsRaw.map(item => ({
      feature: item.feature,
      count: item._count.id
    }));

    // 3. TBC Screenings metrics
    const totalTbcScreenings = await prisma.skriningTbc.count();
    const tbcStatsRaw = await prisma.skriningTbc.groupBy({
      by: ['screeningResult'],
      _count: { id: true }
    });
    const tbcStats = tbcStatsRaw.reduce((acc, curr) => {
      acc[curr.screeningResult] = curr._count.id;
      return acc;
    }, { LOW: 0, MEDIUM: 0, HIGH: 0 });

    const recentScreenings = await prisma.skriningTbc.findMany({
      take: 10,
      orderBy: { screeningDate: 'desc' },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    // 4. Ambulance Requests
    const totalAmbulanceRequests = await prisma.pendaftaranAmbulansSoetomo.count();
    const recentAmbulanceRequests = await prisma.pendaftaranAmbulansSoetomo.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, phoneNumber: true }
        }
      }
    });

    // 5. Hospital Registrations metrics (across all 5 hospitals)
    const getHospitalRegStats = async (model) => {
      const total = await prisma[model].count();
      const pending = await prisma[model].count({ where: { status: 'PENDING' } });
      const approved = await prisma[model].count({ where: { status: 'APPROVED' } });
      const rejected = await prisma[model].count({ where: { status: 'REJECTED' } });
      return { total, pending, approved, rejected };
    };

    const [soetomoRegs, hajiRegs, karsaRegs, saifulRegs, dahaRegs] = await Promise.all([
      getHospitalRegStats('pendaftaranSoetomo'),
      getHospitalRegStats('pendaftaranHajiJatim'),
      getHospitalRegStats('pendaftaranKarsahusada'),
      getHospitalRegStats('pendaftaranSaifulAnwar'),
      getHospitalRegStats('pendaftaranDahaHusada')
    ]);

    const hospitalRegistrations = {
      soetomo: soetomoRegs,
      hajiJatim: hajiRegs,
      karsahusada: karsaRegs,
      saifulAnwar: saifulRegs,
      dahaHusada: dahaRegs,
      totalAll: soetomoRegs.total + hajiRegs.total + karsaRegs.total + saifulRegs.total + dahaRegs.total
    };

    return {
      users: {
        total: totalUsers,
        growth: {
          last24h: newUsers24h,
          last7d: newUsers7d,
          last30d: newUsers30d
        },
        active: {
          last24h: activeUsers24h,
          last7d: activeUsers7d
        }
      },
      activities: {
        total: totalActivities,
        features: featureStats
      },
      tbcScreening: {
        total: totalTbcScreenings,
        results: tbcStats,
        recent: recentScreenings.map(s => ({
          id: s.id,
          userName: s.user?.name || 'Unknown',
          userEmail: s.user?.email || 'Unknown',
          result: s.screeningResult,
          date: s.screeningDate
        }))
      },
      ambulance: {
        total: totalAmbulanceRequests,
        recent: recentAmbulanceRequests.map(r => ({
          id: r.id,
          userName: r.user?.name || 'Unknown',
          phoneNumber: r.user?.phoneNumber || 'Unknown',
          keluhan: r.keluhan,
          address: r.address,
          date: r.createdAt
        }))
      },
      hospitalRegistrations
    };
  } catch (error) {
    console.error('Error gathering admin metrics:', error.message);
    throw new Error('Failed to gather admin metrics from database: ' + error.message);
  }
};

/**
 * Resets the in-memory traffic logging stats
 */
export const resetTrafficStats = () => {
  return clearTrafficStats();
};
