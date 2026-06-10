import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { asyncHandler } from '../utils/errors';
import { validate, schemas } from '../middleware/validate';
import { requireAuth, requireRole } from '../middleware/auth';
import { uploadGeneric } from '../utils/upload';

const router: Router = Router();

// POST /api/contact/inquiry — public
router.post(
  '/inquiry',
  validate(schemas.contactInquiry),
  asyncHandler(async (req: Request, res: Response) => {
    const inquiry = await prisma.contactInquiry.create({
      data: req.body,
    });

    res.status(201).json({ item: inquiry });
  })
);

// POST /api/contact/b2b — public (with optional attachment)
router.post(
  '/b2b',
  uploadGeneric.single('attachment'),
  validate(schemas.b2bInquiry),
  asyncHandler(async (req: Request, res: Response) => {
    const data = { ...req.body };

    if (req.file) {
      data.attachments = JSON.stringify([`/uploads/${req.file.filename}`]);
    }

    const inquiry = await prisma.b2BInquiry.create({ data });

    res.status(201).json({ item: inquiry });
  })
);

// GET /api/contact/inquiries — admin only
router.get(
  '/inquiries',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (_req: Request, res: Response) => {
    const [contact, b2b] = await Promise.all([
      prisma.contactInquiry.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.b2BInquiry.findMany({ orderBy: { createdAt: 'desc' } }),
    ]);

    res.json({ contact, b2b });
  })
);

// PATCH /api/contact/inquiries/:id/read — admin only
router.patch(
  '/inquiries/:id/read',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const type = req.query.type as string;

    if (type === 'b2b') {
      await prisma.b2BInquiry.update({ where: { id }, data: { isRead: true } });
    } else {
      await prisma.contactInquiry.update({ where: { id }, data: { isRead: true } });
    }

    res.json({ ok: true });
  })
);

export default router;
