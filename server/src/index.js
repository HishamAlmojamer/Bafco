const path = require('path');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const categoriesRoutes = require('./routes/categories');

const { ensureUploadsDir } = require('./utils/files');

async function main() {
  await ensureUploadsDir();

  const app = express();

  app.use(cors({ origin: true, credentials: false }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: true,
      legacyHeaders: false
    })
  );

  app.use('/api/auth', authRoutes);
  app.use('/api/products', productsRoutes);
  app.use('/api/categories', categoriesRoutes);

  // Static frontend
  app.use(express.static(path.join(__dirname, '../../web')));

  // Serve uploads
  app.use('/uploads', express.static(path.join(__dirname, '../../public/uploads')));

  // SPA fallback
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../web/index.html'));
  });

  // Global Error Handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ error: message });
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

