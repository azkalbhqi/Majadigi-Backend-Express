import { performance } from 'perf_hooks';

// In-memory traffic metrics storage
const MAX_LOGS = 1000;
let requestLogs = [];

let stats = {
  totalRequests: 0,
  statusCodes: {
    '2xx': 0,
    '3xx': 0,
    '4xx': 0,
    '5xx': 0,
    details: {}
  },
  methods: {},
  routes: {},
  latency: {
    total: 0,
    min: null,
    max: null,
    avg: 0
  },
  hourlyDistribution: Array(24).fill(0)
};

/**
 * Normalizes routes by stripping query parameters and grouping dynamic IDs where possible.
 */
const normalizePath = (path) => {
  // Strip trailing slash and query params
  let normalized = path.split('?')[0].replace(/\/$/, '');
  if (!normalized) return '/';
  
  // Replace UUIDs or long numbers with placeholder to group routing stats
  normalized = normalized.replace(/\/[0-9a-fA-F-]{36}(\/|$)/g, '/:id$1');
  normalized = normalized.replace(/\/\d+(\/|$)/g, '/:id$1');
  
  return normalized;
};

/**
 * Traffic Interceptor middleware for logging API traffic
 */
export const trafficInterceptor = (req, res, next) => {
  const path = req.path || req.url.split('?')[0];
  
  // Ignore monitoring dashboard calls and general docs/health check files to avoid self-pollution
  if (
    path.startsWith('/monitoring') || 
    path.startsWith('/health') || 
    path.startsWith('/docs') || 
    path === '/'
  ) {
    return next();
  }

  const startTime = performance.now();
  
  res.on('finish', () => {
    const duration = parseFloat((performance.now() - startTime).toFixed(2));
    const statusCode = res.statusCode;
    const method = req.method;
    const normalizedPath = normalizePath(path);
    const timestamp = new Date();
    
    // Create new log entry
    const logEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: timestamp.toISOString(),
      method,
      path: normalizedPath,
      statusCode,
      latency: duration,
      ip: req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'] || 'Unknown'
    };

    // Add to sliding window
    requestLogs.unshift(logEntry);
    if (requestLogs.length > MAX_LOGS) {
      requestLogs.pop();
    }

    // Update global aggregates
    stats.totalRequests += 1;
    
    // Status Code Aggregates
    const statusGroup = `${Math.floor(statusCode / 100)}xx`;
    if (statusGroup in stats.statusCodes) {
      stats.statusCodes[statusGroup] += 1;
    }
    stats.statusCodes.details[statusCode] = (stats.statusCodes.details[statusCode] || 0) + 1;
    
    // Method Aggregates
    stats.methods[method] = (stats.methods[method] || 0) + 1;
    
    // Route Path Aggregates
    stats.routes[normalizedPath] = (stats.routes[normalizedPath] || 0) + 1;
    
    // Latency Aggregates
    stats.latency.total += duration;
    stats.latency.avg = parseFloat((stats.latency.total / stats.totalRequests).toFixed(2));
    
    if (stats.latency.min === null || duration < stats.latency.min) {
      stats.latency.min = duration;
    }
    if (stats.latency.max === null || duration > stats.latency.max) {
      stats.latency.max = duration;
    }
    
    // Hourly Distribution (0-23)
    const hour = timestamp.getHours();
    stats.hourlyDistribution[hour] += 1;
  });

  next();
};

/**
 * Returns the sliding window of traffic logs
 */
export const getRequestLogs = (limit = 100) => {
  return requestLogs.slice(0, limit);
};

/**
 * Returns current aggregated traffic statistics
 */
export const getAggregatedStats = () => {
  const errorCount = stats.statusCodes['4xx'] + stats.statusCodes['5xx'];
  const errorRate = stats.totalRequests > 0 
    ? parseFloat(((errorCount / stats.totalRequests) * 100).toFixed(2)) 
    : 0;

  return {
    ...stats,
    errorRate
  };
};

/**
 * Reset all monitoring metrics
 */
export const clearStats = () => {
  requestLogs = [];
  stats = {
    totalRequests: 0,
    statusCodes: {
      '2xx': 0,
      '3xx': 0,
      '4xx': 0,
      '5xx': 0,
      details: {}
    },
    methods: {},
    routes: {},
    latency: {
      total: 0,
      min: null,
      max: null,
      avg: 0
    },
    hourlyDistribution: Array(24).fill(0)
  };
  return true;
};
