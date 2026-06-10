const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const { globalErrorHandler } = require('../server/dist/utils/errors');
const authRoutes = require('../server/dist/routes/auth').default;
const productsRoutes = require('../server/dist/routes/products').default;
const categoriesRoutes = require('../server/dist/routes/categories').default;
const careersRoutes = require('../server/dist/routes/careers').default;
const contactRoutes = require('../server/dist/routes/contact').default;
const investorsRoutes = require('../server/dist/routes/investors').default;
const cartRoutes = require('../server/dist/routes/cart').default;
const ordersRoutes = require('../server/dist/routes/orders').default;

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: '*', credentials: true }));
app.use(compression());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later' },
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/careers', careersRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/investors', investorsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(globalErrorHandler);

module.exports = app;
