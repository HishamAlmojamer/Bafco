const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { prisma } = require('../utils/prisma');
const { requireAuth, requireRole } = require('../middleware/auth');
const { asyncHandler } = require('../utils/errors');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../../public/uploads');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const name = `p_${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`;
    cb(null, name);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^image\//.test(file.mimetype);
    cb(ok ? null : new Error('Only images allowed'), ok);
  }
});

router.get('/', asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
  const skip = Number(req.query.skip || 0);
  const take = Number(req.query.take || 100);

  const where = {
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } }
          ]
        }
      : {}),
    ...(categoryId ? { categoryId } : {})
  };

  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { id: 'desc' },
      skip,
      take
    })
  ]);

  res.json({ total, items });
}));

router.post('/', requireAuth, requireRole('ADMIN'), upload.single('image'), asyncHandler(async (req, res) => {
  const body = req.body || {};
  const name = (body.name || '').trim();
  const description = (body.description || '').trim();
  const price = Number(body.price || 0);
  const categoryId = body.categoryId ? Number(body.categoryId) : null;

  if (!name) return res.status(400).json({ error: 'name is required' });

  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  const created = await prisma.product.create({
    data: {
      name,
      description,
      price,
      imageUrl: imagePath,
      categoryId
    }
  });

  res.status(201).json({ item: created });
}));

router.put('/:id', requireAuth, requireRole('ADMIN'), upload.single('image'), asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const body = req.body || {};

  const name = body.name !== undefined ? String(body.name).trim() : undefined;
  const description = body.description !== undefined ? String(body.description).trim() : undefined;
  const price = body.price !== undefined ? Number(body.price) : undefined;
  const categoryId = body.categoryId !== undefined ? (body.categoryId ? Number(body.categoryId) : null) : undefined;

  const update = {};
  if (name !== undefined) update.name = name;
  if (description !== undefined) update.description = description;
  if (price !== undefined) update.price = price;
  if (categoryId !== undefined) update.categoryId = categoryId;
  if (req.file) update.imageUrl = `/uploads/${req.file.filename}`;

  const updated = await prisma.product.update({
    where: { id },
    data: update
  });

  res.json({ item: updated });
}));

router.delete('/:id', requireAuth, requireRole('ADMIN'), asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  await prisma.product.delete({ where: { id } });
  res.json({ ok: true });
}));

module.exports = router;

