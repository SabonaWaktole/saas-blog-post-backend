// Main Application Entry Point
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import routes from './presentation/routes';
import { errorMiddleware, requestLogger } from './presentation/middlewares';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: config.cors.origin,
    credentials: true,
}));

// Request logging
app.use(requestLogger);

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Increased limit for development/testing
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later' },
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Trust proxy for accurate IP detection (for Render)
app.set('trust proxy', 1);

// API routes
app.use('/api/v1', routes);

// Global error handler
app.use(errorMiddleware);

// 404 handler
app.use((req, res) => {
    console.log(`\x1b[33m[WARN] Route not found: ${req.method} ${req.originalUrl}\x1b[0m`);
    res.status(404).json({ error: 'Not found' });
});

// Start server
const PORT = config.port;

app.listen(PORT, () => {
    console.log(`🚀 Mindful CMS Backend running on port ${PORT}`);
    console.log(`📚 API: http://localhost:${PORT}/api/v1`);
    console.log(`💾 Environment: ${config.env}`);
});

export default app;
