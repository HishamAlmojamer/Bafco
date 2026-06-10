const express = require('express');
const { prisma } = require('../utils/prisma');
const { requireAuth, requireRole } = require('../middleware/auth');
const { asyncHandler } = require('../utils/errors');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });
  res.json({ items: categories });
}));

router.post('/', requireAuth, requireRole('ADMIN'), asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  try {
    const created = await prisma.category.create({
      data: { name }
    });
    res.status(201).json({ item: created });
  } catch (e) {
    if (e.code === 'P2002') {
      return res.status(400).json({ error: 'Category already exists' });
    }
    throw e;
  }
}));

router.delete('/:id', requireAuth, requireRole('ADMIN'), asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  await prisma.category.delete({ where: { id } });
  res.json({ ok: true });
}));

module.exports = router;
