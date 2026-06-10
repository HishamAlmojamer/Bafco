import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { asyncHandler, NotFoundError } from '../utils/errors';
import { validate, schemas } from '../middleware/validate';
import { requireAuth, requireRole } from '../middleware/auth';
import { uploadImage } from '../utils/upload';
import { withCache, cacheDel } from '../utils/cache';

const router: Router = Router();

// GET /api/products — public, with caching
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const q = (req.query.q as string || '').trim();
    const categorySlug = req.query.category as string | undefined;
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined;
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
    const skip = Number(req.query.skip || 0);
    const take = Math.min(Number(req.query.take || 50), 100);

    const where: Record<string, unknown> = { isActive: true };

    if (q) {
      where.OR = [
        { nameAr: { contains: q } },
        { nameEn: { contains: q } },
        { descriptionAr: { contains: q } },
        { descriptionEn: { contains: q } },
      ];
    }

    if (categoryId && Number.isInteger(categoryId)) {
      where.categoryId = categoryId;
    } else if (categorySlug) {
      const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
      if (category) {
        where.categoryId = category.id;
      }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) (where.price as Record<string, unknown>).gte = minPrice;
      if (maxPrice !== undefined) (where.price as Record<string, unknown>).lte = maxPrice;
    }

    const cacheKey = `products:${JSON.stringify({ q, categorySlug, categoryId, minPrice, maxPrice, skip, take })}`;

    const result = await withCache(
      cacheKey,
      async () => {
        const [total, items] = await Promise.all([
          prisma.product.count({ where }),
          prisma.product.findMany({
            where,
            include: { category: true },
            orderBy: { createdAt: 'desc' },
            skip,
            take,
          }),
        ]);
        return { total, items };
      },
      120
    );

    res.json(result);
  })
);

// GET /api/products/:slug — public
router.get(
  '/:slug',
  asyncHandler(async (req: Request, res: Response) => {
    const product = await prisma.product.findUnique({
      where: { slug: String(req.params.slug) },
      include: { category: true },
    });

    if (!product) {
      throw new NotFoundError('Product');
    }

    res.json({ item: product });
  })
);

// POST /api/products — admin only
router.post(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  uploadImage.single('image'),
  validate(schemas.createProduct),
  asyncHandler(async (req: Request, res: Response) => {
    const data = { ...req.body };

    if (req.file) {
      data.imageUrl = `/uploads/${req.file.filename}`;
    }

    // Generate slug from English name if not provided
    if (!data.slug) {
      data.slug = data.nameEn
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    const product = await prisma.product.create({ data });
    await cacheDel('products:*');

    res.status(201).json({ item: product });
  })
);

// PUT /api/products/:id — admin only
router.put(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  uploadImage.single('image'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Product');

    const data: Record<string, unknown> = { ...req.body };
    if (req.file) {
      data.imageUrl = `/uploads/${req.file.filename}`;
    }

    const product = await prisma.product.update({ where: { id }, data });
    await cacheDel('products:*');

    res.json({ item: product });
  })
);

// DELETE /api/products/:id — admin only
router.delete(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Product');

    await prisma.product.delete({ where: { id } });
    await cacheDel('products:*');

    res.json({ ok: true });
  })
);

export default router;
