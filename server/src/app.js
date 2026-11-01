const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const familyRoutes = require('./routes/familyRoutes');
const childRoutes = require('./routes/childRoutes');
const pairingRoutes = require('./routes/pairingRoutes');
const deviceRoutes = require('./routes/deviceRoutes');
const locationRoutes = require('./routes/locationRoutes');
const geofenceRoutes = require('./routes/geofenceRoutes');
const usageRoutes = require('./routes/usageRoutes');
const alertRoutes = require('./routes/alertRoutes');
const sosRoutes = require('./routes/sosRoutes');
const routineRoutes = require('./routes/routineRoutes');
const reportRoutes = require('./routes/reportRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Trust reverse proxy (Render, Vercel, Nginx, Cloudflare) so Express and express-rate-limit identify client IPs accurately
app.set('trust proxy', 1);

// Security Middlewares
app.use(helmet());

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const isAllowed =
        !process.env.CORS_ORIGIN ||
        process.env.CORS_ORIGIN === '*' ||
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes('*') ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:') ||
        origin.endsWith('.vercel.app');

      if (isAllowed) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true
  })
);

// Rate Limiting (generous ceiling for real-time mobile telemetry, heartbeat, and live parent monitoring)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api/', limiter);

// Dedicated Authentication Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again in a few minutes.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoints
const healthHandler = (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'GuardianX SaaS Backend API',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date()
  });
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// API Routes
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/families', familyRoutes);
app.use('/api/children', childRoutes);
app.use('/api/pairing', pairingRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/geofences', geofenceRoutes);
app.use('/api/usage', usageRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.originalUrl} not found.`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : undefined
  });
});

module.exports = app;
