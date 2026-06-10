import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { config } from './config';
import { globalErrorHandler } from './utils/errors';
import authRoutes from './routes/auth';
import productsRoutes from './routes/products';
import categoriesRoutes from './routes/categories';
import careersRoutes from './routes/careers';
import contactRoutes from './routes/contact';
import investorsRoutes from './routes/investors';
import cartRoutes from './routes/cart';
import ordersRoutes from './routes/orders';

async function main() {
  const app = express();

  // Security
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({ origin: config.corsOrigin, credentials: true }));
  app.use(compression());

  // Rate limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: 'Too many requests, please try again later' },
    })
  );

  // Logging
  if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
  }

  // Body parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productsRoutes);
  app.use('/api/categories', categoriesRoutes);
  app.use('/api/careers', careersRoutes);
  app.use('/api/contact', contactRoutes);
  app.use('/api/investors', investorsRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/orders', ordersRoutes);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Serve uploaded files
  app.use('/uploads', express.static(path.resolve(config.uploadDir)));

  // Serve the production React build when available, otherwise fall back to the legacy static web folder.
  const clientDistPath = path.join(__dirname, '../../client/dist');
  const legacyWebPath = path.join(__dirname, '../../web');
  const frontendPath = fs.existsSync(path.join(clientDistPath, 'index.html')) ? clientDistPath : legacyWebPath;
  app.use(express.static(frontendPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }

    const indexPath = path.join(frontendPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }

    return next();
  });

  // Global error handler (must be last)
  app.use(globalErrorHandler);

  app.listen(config.port, () => {
    console.log(`BAFCO server running on http://localhost:${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
