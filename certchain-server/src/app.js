import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Middleware Imports
import errorHandler from './middleware/errorHandler.js';
import { apiLimiter, verifyLimiter } from './middleware/rateLimiter.js';

// Route Imports
import certRoutes from './routes/cert.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import institutionRoutes from './routes/institution.routes.js';
import bulkRoutes from './routes/bulk.routes.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Global Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '5mb' })); // Increase limit for CSV uploads

// Rate Limiters
app.use('/api/v1/certificates/verify', verifyLimiter);
app.use('/api/v1', apiLimiter);

// Routes
app.use('/api/v1/certificates', certRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/institutions', institutionRoutes);
app.use('/api/v1/bulk', bulkRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'BC-01 Portal API is running' });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server API listening on port ${PORT}`);
});

export default app;
