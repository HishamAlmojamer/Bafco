import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { asyncHandler, NotFoundError } from '../utils/errors';
import { requireAuth, requireRole } from '../middleware/auth';
import { uploadGeneric } from '../utils/upload';
import { withCache } from '../utils/cache';

const router: Router = Router();

// GET /api/investors/documents — public
router.get(
  '/documents',
  asyncHandler(async (req: Request, res: Response) => {
    const type = req.query.type as string | undefined;
    const year = req.query.year ? Number(req.query.year) : undefined;

    const where: Record<string, unknown> = { isPublished: true };
    if (type) where.type = type;
    if (year) where.year = year;

    const result = await withCache(
      `investors:docs:${JSON.stringify(where)}`,
      () =>
        prisma.investorDocument.findMany({
          where,
          orderBy: [{ year: 'desc' }, { quarter: 'asc' }, { sortOrder: 'asc' }],
          select: {
            id: true,
            titleAr: true,
            titleEn: true,
            slug: true,
            type: true,
            fileUrl: true,
            year: true,
            quarter: true,
            createdAt: true,
          },
        }),
      600
    );

    res.json({ items: result });
  })
);

// POST /api/investors/documents — admin only
router.post(
  '/documents',
  requireAuth,
  requireRole('ADMIN'),
  uploadGeneric.single('file'),
  asyncHandler(async (req: Request, res: Response) => {
    const data = { ...req.body };

    if (req.file) {
      data.fileUrl = `/uploads/${req.file.filename}`;
    }

    const doc = await prisma.investorDocument.create({ data });
    res.status(201).json({ item: doc });
  })
);

// DELETE /api/investors/documents/:id — admin only
router.delete(
  '/documents/:id',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const doc = await prisma.investorDocument.findUnique({ where: { id } });
    if (!doc) throw new NotFoundError('Document');

    await prisma.investorDocument.delete({ where: { id } });
    res.json({ ok: true });
  })
);

// GET /api/investors/news — public
router.get(
  '/news',
  asyncHandler(async (req: Request, res: Response) => {
    const category = req.query.category as string | undefined;
    const skip = Number(req.query.skip || 0);
    const take = Math.min(Number(req.query.take || 20), 50);

    const where: Record<string, unknown> = { isPublished: true };
    if (category) where.category = category;

    const result = await withCache(
      `investors:news:${JSON.stringify(where)}:${skip}:${take}`,
      () =>
        Promise.all([
          prisma.newsArticle.count({ where }),
          prisma.newsArticle.findMany({
            where,
            orderBy: { publishedAt: 'desc' },
            skip,
            take,
            select: {
              id: true,
              titleAr: true,
              titleEn: true,
              slug: true,
              excerptAr: true,
              excerptEn: true,
              imageUrl: true,
              category: true,
              publishedAt: true,
            },
          }),
        ]),
      300
    );

    res.json({ total: result[0], items: result[1] });
  })
);

export default router;
