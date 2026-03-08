import rateLimit from 'express-rate-limit';

// Rate limiter for public verification endpoint (20 req/min per IP)
export const verifyLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Too many verification requests, please try again later.', statusCode: 429 }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter for authenticated API endpoints (100 req/min per IP)
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Too many API requests, please try again later.', statusCode: 429 }
  },
  standardHeaders: true,
  legacyHeaders: false
});
