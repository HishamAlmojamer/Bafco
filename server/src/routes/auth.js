const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { prisma } = require('../utils/prisma');
const { requireJsonBody } = require('../utils/validators');

const router = express.Router();

router.post('/login', async (req, res) => {
  const body = req.body || {};
  requireJsonBody(body, ['email', 'password']);

  const { email, password } = body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });

  const token = jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({ token, role: user.role });
});

router.post('/register', async (req, res) => {
  const body = req.body || {};
  requireJsonBody(body, ['email', 'password', 'name']);

  const { email, password, name, phone } = body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'البريد الإلكتروني مسجل مسبقاً' });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { 
      email, 
      passwordHash, 
      name, 
      phone,
      role: 'CUSTOMER' 
    }
  });

  const token = jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({ token, role: user.role });
});

router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'غير مصرح' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, role: true, phone: true }
    });
    if (!user) return res.status(404).json({ error: 'المستخدم غير موجود' });
    return res.json(user);
  } catch (e) {
    return res.status(401).json({ error: 'جلسة منتهية' });
  }
});

// Create first admin (simple bootstrap). In production you'd restrict this.
router.post('/bootstrap-admin', async (req, res) => {
  const body = req.body || {};
  requireJsonBody(body, ['email', 'password']);

  const { email, password } = body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Admin already exists' });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, passwordHash, role: 'ADMIN' }
  });

  return res.json({ ok: true, id: user.id });
});

module.exports = router;

