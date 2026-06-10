import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { asyncHandler, NotFoundError } from '../utils/errors';
import { validate, schemas } from '../middleware/validate';
import { requireAuth, requireRole } from '../middleware/auth';
import { withCache } from '../utils/cache';

const router: Router = Router();

router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const result = await withCache(
      'categories:all',
      () =>
        prisma.category.findMany({
          orderBy: { sortOrder: 'asc' },
          include: { _count: { select: { products: true } } },
        }),
      600
    );

    res.json({ items: result });
  })
);

router.get(
  '/:slug',
  asyncHandler(async (req: Request, res: Response) => {
    const category = await prisma.category.findUnique({
      where: { slug: String(req.params.slug) },
      include: {
        products: { where: { isActive: true }, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!category) throw new NotFoundError('Category');
    res.json({ item: category });
  })
);

router.post(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  validate(schemas.createCategory),
  asyncHandler(async (req: Request, res: Response) => {
    const category = await prisma.category.create({ data: req.body });
    res.status(201).json({ item: category });
  })
);

router.put(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Category');

    const category = await prisma.category.update({
      where: { id },
      data: req.body,
    });

    res.json({ item: category });
  })
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Category');

    await prisma.category.delete({ where: { id } });
    res.json({ ok: true });
  })
);

export default router;
