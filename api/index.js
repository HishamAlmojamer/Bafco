const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('./_lib/db');
const multer = require('multer');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
function signToken(payload) { return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }); }
function extractUser(req) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return null;
  try { return jwt.verify(auth.slice(7), JWT_SECRET); } catch { return null; }
}

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// ─── HEALTH ────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── AUTH ──────────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const r = await query('SELECT id, email, "passwordHash", name, role FROM "User" WHERE email = $1', [email]);
    if (r.rows.length === 0) return res.status(401).json({ error: 'Invalid email or password' });

    const user = r.rows[0];
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(401).json({ error: 'Invalid email or password' });

    const token = signToken({ sub: user.id, role: user.role, email: user.email });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body || {};
    if (!email || !password || !name) return res.status(400).json({ error: 'Email, password, and name are required' });

    const existing = await query('SELECT id FROM "User" WHERE email = $1', [email]);
    if (existing.rows.length > 0) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 12);
    const r = await query(
      'INSERT INTO "User" (email, "passwordHash", name, phone, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id, email, name, phone, role',
      [email, passwordHash, name, phone || null, 'CUSTOMER']
    );
    const user = r.rows[0];
    const token = signToken({ sub: user.id, role: user.role, email: user.email });
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const userData = extractUser(req);
    if (!userData) return res.status(401).json({ error: 'Unauthorized' });

    const r = await query('SELECT id, email, name, phone, role, address FROM "User" WHERE id = $1', [userData.sub]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ user: r.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── PRODUCTS ──────────────────────────────────────────────────
app.get('/api/products', async (req, res) => {
  try {
    const { q, category, skip, take } = req.query;
    const conditions = ['p."isActive" = true'];
    const params = [];
    let paramIdx = 1;

    if (q) { conditions.push(`(p."nameAr" ILIKE $${paramIdx} OR p."nameEn" ILIKE $${paramIdx})`); params.push(`%${q}%`); paramIdx++; }
    if (category) { conditions.push(`c.slug = $${paramIdx}`); params.push(category); paramIdx++; }

    const where = conditions.join(' AND ');
    const offset = parseInt(skip) || 0;
    const limit = Math.min(parseInt(take) || 20, 100);

    const countResult = await query(`SELECT COUNT(*) FROM "Product" p LEFT JOIN "Category" c ON p."categoryId" = c.id WHERE ${where}`, params);
    const total = parseInt(countResult.rows[0].count);

    const dataResult = await query(
      `SELECT p.*, c."nameAr" as "categoryNameAr", c."nameEn" as "categoryNameEn", c.slug as "categorySlug"
       FROM "Product" p LEFT JOIN "Category" c ON p."categoryId" = c.id
       WHERE ${where} ORDER BY p."createdAt" DESC LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, limit, offset]
    );

    res.json({ items: dataResult.rows, total, skip: offset, take: limit });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/products/:slug', async (req, res) => {
  try {
    const isId = /^\d+$/.test(req.params.slug);
    const r = await query(
      `SELECT p.*, c."nameAr" as "categoryNameAr", c."nameEn" as "categoryNameEn", c.slug as "categorySlug"
       FROM "Product" p LEFT JOIN "Category" c ON p."categoryId" = c.id
       WHERE ${isId ? 'p.id' : 'p.slug'} = $1`,
      [isId ? parseInt(req.params.slug) : req.params.slug]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ item: r.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/products', upload.single('image'), async (req, res) => {
  try {
    const userData = extractUser(req);
    if (!userData || userData.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

    const { nameAr, nameEn, slug, price, sku, unitSize, descriptionAr, descriptionEn, categoryId } = req.body;
    if (!nameAr || !nameEn) return res.status(400).json({ error: 'Arabic and English names are required' });

    const productSlug = slug || nameEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const r = await query(
      `INSERT INTO "Product" ("nameAr", "nameEn", slug, price, sku, "unitSize", "descriptionAr", "descriptionEn", "categoryId", "isActive", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, NOW(), NOW())
       RETURNING *`,
      [nameAr, nameEn, productSlug, parseFloat(price) || 0, sku || null, unitSize || null, descriptionAr || null, descriptionEn || null, categoryId ? parseInt(categoryId) : null]
    );
    res.status(201).json({ item: r.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/products/:id', upload.single('image'), async (req, res) => {
  try {
    const userData = extractUser(req);
    if (!userData || userData.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

    const fields = ['"nameAr"', '"nameEn"', 'slug', 'price', 'sku', '"unitSize"', '"descriptionAr"', '"descriptionEn"', '"categoryId"'];
    const updates = [];
    const params = [];
    let idx = 1;

    for (const field of fields) {
      const key = field.replace(/"/g, '');
      if (req.body[key] !== undefined) {
        updates.push(`${field} = $${idx}`);
        params.push(key === 'price' ? parseFloat(req.body[key]) || 0 : key === 'categoryId' ? parseInt(req.body[key]) || null : req.body[key]);
        idx++;
      }
    }

    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

    updates.push('"updatedAt" = NOW()');
    params.push(parseInt(req.params.id));

    const r = await query(
      `UPDATE "Product" SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ item: r.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const userData = extractUser(req);
    if (!userData || userData.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

    const r = await query('DELETE FROM "Product" WHERE id = $1 RETURNING id', [parseInt(req.params.id)]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── CATEGORIES ────────────────────────────────────────────────
app.get('/api/categories', async (req, res) => {
  try {
    const r = await query(
      `SELECT c.*, COUNT(p.id)::int as "productCount"
       FROM "Category" c LEFT JOIN "Product" p ON p."categoryId" = c.id
       GROUP BY c.id ORDER BY c."sortOrder" ASC, c."nameEn" ASC`
    );
    res.json({ items: r.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/categories/:slug', async (req, res) => {
  try {
    const isId = /^\d+$/.test(req.params.slug);
    const r = await query(
      `SELECT c.*, COUNT(p.id)::int as "productCount"
       FROM "Category" c LEFT JOIN "Product" p ON p."categoryId" = c.id
       WHERE ${isId ? 'c.id' : 'c.slug'} = $1 GROUP BY c.id`,
      [isId ? parseInt(req.params.slug) : req.params.slug]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'Category not found' });
    res.json({ item: r.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/categories', async (req, res) => {
  try {
    const userData = extractUser(req);
    if (!userData || userData.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

    const { nameAr, nameEn, slug, sortOrder } = req.body;
    if (!nameAr || !nameEn || !slug) return res.status(400).json({ error: 'Arabic name, English name, and slug are required' });

    const r = await query(
      'INSERT INTO "Category" ("nameAr", "nameEn", slug, "sortOrder", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *',
      [nameAr, nameEn, slug, sortOrder || 0]
    );
    res.status(201).json({ item: r.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/categories/:id', async (req, res) => {
  try {
    const userData = extractUser(req);
    if (!userData || userData.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

    const fields = ['"nameAr"', '"nameEn"', 'slug', '"sortOrder"'];
    const updates = [];
    const params = [];
    let idx = 1;

    for (const field of fields) {
      const key = field.replace(/"/g, '');
      if (req.body[key] !== undefined) {
        updates.push(`${field} = $${idx}`);
        params.push(req.body[key]);
        idx++;
      }
    }

    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
    updates.push('"updatedAt" = NOW()');
    params.push(parseInt(req.params.id));

    const r = await query(`UPDATE "Category" SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`, params);
    if (r.rows.length === 0) return res.status(404).json({ error: 'Category not found' });
    res.json({ item: r.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const userData = extractUser(req);
    if (!userData || userData.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

    const r = await query('DELETE FROM "Category" WHERE id = $1 RETURNING id', [parseInt(req.params.id)]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'Category not found' });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── ORDERS ────────────────────────────────────────────────────
app.get('/api/orders', async (req, res) => {
  try {
    const userData = extractUser(req);
    if (!userData) return res.status(401).json({ error: 'Unauthorized' });
    if (userData.role === 'ADMIN') {
      const r = await query('SELECT * FROM "Order" ORDER BY "createdAt" DESC');
      return res.json({ items: r.rows });
    }
    const r = await query('SELECT * FROM "Order" WHERE "userId" = $1 ORDER BY "createdAt" DESC', [userData.sub]);
    res.json({ items: r.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/orders', async (req, res) => {
  try {
    const userData = extractUser(req);
    if (!userData) return res.status(401).json({ error: 'Unauthorized' });

    const { notes } = req.body || {};
    const cart = await query(
      'SELECT ci.*, p.price FROM "CartItem" ci JOIN "Product" p ON ci."productId" = p.id WHERE ci."cartId" = (SELECT id FROM "Cart" WHERE "userId" = $1)',
      [userData.sub]
    );
    if (cart.rows.length === 0) return res.status(400).json({ error: 'Cart is empty' });

    const total = cart.rows.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);

    const order = await query(
      'INSERT INTO "Order" ("userId", status, total, notes, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *',
      [userData.sub, 'PENDING', total, notes || null]
    );

    for (const item of cart.rows) {
      await query(
        'INSERT INTO "OrderItem" ("orderId", "productId", quantity, price) VALUES ($1, $2, $3, $4)',
        [order.rows[0].id, item.productId, item.quantity, item.price]
      );
    }

    await query('DELETE FROM "CartItem" WHERE "cartId" = (SELECT id FROM "Cart" WHERE "userId" = $1)', [userData.sub]);
    res.status(201).json({ item: order.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const userData = extractUser(req);
    if (!userData || userData.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });

    const r = await query('UPDATE "Order" SET status = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *', [status, parseInt(req.params.id)]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    res.json({ item: r.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── CART ──────────────────────────────────────────────────────
app.get('/api/cart', async (req, res) => {
  try {
    const userData = extractUser(req);
    if (!userData) return res.status(401).json({ error: 'Unauthorized' });

    let cart = await query('SELECT * FROM "Cart" WHERE "userId" = $1', [userData.sub]);
    if (cart.rows.length === 0) {
      cart = await query('INSERT INTO "Cart" ("userId", "createdAt", "updatedAt") VALUES ($1, NOW(), NOW()) RETURNING *', [userData.sub]);
    }
    const items = await query(
      'SELECT ci.*, p."nameAr", p."nameEn", p.price, p.image FROM "CartItem" ci JOIN "Product" p ON ci."productId" = p.id WHERE ci."cartId" = $1',
      [cart.rows[0].id]
    );
    res.json({ ...cart.rows[0], items: items.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/cart/items', async (req, res) => {
  try {
    const userData = extractUser(req);
    if (!userData) return res.status(401).json({ error: 'Unauthorized' });

    const { productId, quantity } = req.body;
    if (!productId) return res.status(400).json({ error: 'Product ID is required' });

    let cart = await query('SELECT id FROM "Cart" WHERE "userId" = $1', [userData.sub]);
    if (cart.rows.length === 0) {
      cart = await query('INSERT INTO "Cart" ("userId", "createdAt", "updatedAt") VALUES ($1, NOW(), NOW()) RETURNING id', [userData.sub]);
    }

    const existing = await query('SELECT id, quantity FROM "CartItem" WHERE "cartId" = $1 AND "productId" = $2', [cart.rows[0].id, productId]);
    if (existing.rows.length > 0) {
      await query('UPDATE "CartItem" SET quantity = $1, "updatedAt" = NOW() WHERE id = $2', [existing.rows[0].quantity + (quantity || 1), existing.rows[0].id]);
    } else {
      await query('INSERT INTO "CartItem" ("cartId", "productId", quantity, "createdAt", "updatedAt") VALUES ($1, $2, $3, NOW(), NOW())', [cart.rows[0].id, productId, quantity || 1]);
    }

    const cartFull = await query('SELECT * FROM "Cart" WHERE id = $1', [cart.rows[0].id]);
    const items = await query(
      'SELECT ci.*, p."nameAr", p."nameEn", p.price, p.image FROM "CartItem" ci JOIN "Product" p ON ci."productId" = p.id WHERE ci."cartId" = $1',
      [cart.rows[0].id]
    );
    res.json({ ...cartFull.rows[0], items: items.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/cart/items/:id', async (req, res) => {
  try {
    const userData = extractUser(req);
    if (!userData) return res.status(401).json({ error: 'Unauthorized' });

    const { quantity } = req.body;
    if (quantity == null || quantity < 1) return res.status(400).json({ error: 'Valid quantity is required' });

    await query('UPDATE "CartItem" SET quantity = $1, "updatedAt" = NOW() WHERE id = $2', [quantity, parseInt(req.params.id)]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/cart/items/:id', async (req, res) => {
  try {
    const userData = extractUser(req);
    if (!userData) return res.status(401).json({ error: 'Unauthorized' });
    await query('DELETE FROM "CartItem" WHERE id = $1', [parseInt(req.params.id)]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── CONTACT ────────────────────────────────────────────────────
app.post('/api/contact/inquiry', async (req, res) => {
  try {
    const { fullName, email, phone, company, subject, message } = req.body;
    if (!fullName || !email || !subject || !message) return res.status(400).json({ error: 'Required fields missing' });

    const r = await query(
      'INSERT INTO "ContactInquiry" (type, "fullName", email, phone, company, subject, message) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      ['GENERAL', fullName, email, phone || null, company || null, subject, message]
    );
    res.status(201).json({ item: r.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/contact/b2b', async (req, res) => {
  try {
    const { companyName, contactName, email, phone, type, message } = req.body;
    if (!companyName || !contactName || !email || !phone || !type || !message) return res.status(400).json({ error: 'Required fields missing' });

    const r = await query(
      'INSERT INTO "B2BInquiry" ("companyName", "contactName", email, phone, type, message) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [companyName, contactName, email, phone, type, message]
    );
    res.status(201).json({ item: r.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/contact/inquiries', async (req, res) => {
  try {
    const userData = extractUser(req);
    if (!userData || userData.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

    const contact = await query('SELECT * FROM "ContactInquiry" ORDER BY "createdAt" DESC');
    const b2b = await query('SELECT * FROM "B2BInquiry" ORDER BY "createdAt" DESC');
    res.json({ contact: contact.rows, b2b: b2b.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/contact/inquiries/:id/read', async (req, res) => {
  try {
    const userData = extractUser(req);
    if (!userData || userData.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

    const { type } = req.query;
    const table = type === 'b2b' ? '"B2BInquiry"' : '"ContactInquiry"';
    await query(`UPDATE ${table} SET "isRead" = true WHERE id = $1`, [parseInt(req.params.id)]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── 404 catch-all ─────────────────────────────────────────────
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Not found', path: req.originalUrl });
});

// ─── Error handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

module.exports = app;
