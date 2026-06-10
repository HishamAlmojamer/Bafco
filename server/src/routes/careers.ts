import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { asyncHandler, NotFoundError, ValidationError } from '../utils/errors';
import { validate, schemas } from '../middleware/validate';
import { requireAuth, requireRole } from '../middleware/auth';
import { uploadCV } from '../utils/upload';

const router: Router = Router();

// GET /api/careers/jobs — public
router.get(
  '/jobs',
  asyncHandler(async (req: Request, res: Response) => {
    const department = req.query.department as string | undefined;
    const type = req.query.type as string | undefined;
    const skip = Number(req.query.skip || 0);
    const take = Math.min(Number(req.query.take || 50), 100);

    const where: Record<string, unknown> = {
      status: 'PUBLISHED',
      AND: [
        { OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }] },
      ],
    };

    if (department) where.departmentEn = department;
    if (type) where.typeEn = type;

    const [total, items] = await Promise.all([
      prisma.job.count({ where }),
      prisma.job.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip,
        take,
        select: {
          id: true,
          titleAr: true,
          titleEn: true,
          slug: true,
          departmentAr: true,
          departmentEn: true,
          locationAr: true,
          locationEn: true,
          typeAr: true,
          typeEn: true,
          descriptionAr: true,
          descriptionEn: true,
          requirementsAr: true,
          requirementsEn: true,
          salaryMin: true,
          salaryMax: true,
          createdAt: true,
        },
      }),
    ]);

    res.json({ total, items });
  })
);

// GET /api/careers/jobs/:slug — public
router.get(
  '/jobs/:slug',
  asyncHandler(async (req: Request, res: Response) => {
    const job = await prisma.job.findUnique({
      where: { slug: String(req.params.slug) },
    });

    if (!job || job.status !== 'PUBLISHED') {
      throw new NotFoundError('Job');
    }

    res.json({ item: job });
  })
);

// POST /api/careers/apply — public
router.post(
  '/apply',
  uploadCV.single('cv'),
  validate(schemas.applyJob),
  asyncHandler(async (req: Request, res: Response) => {
    const { jobId, fullNameAr, fullNameEn, email, phone, coverLetter, portfolioUrl, linkedInUrl } = req.body;

    const job = await prisma.job.findUnique({ where: { id: Number(jobId) } });
    if (!job || job.status !== 'PUBLISHED') {
      throw new NotFoundError('Job');
    }

    if (!req.file) {
      throw new ValidationError('CV file is required (PDF or DOC)');
    }

    const application = await prisma.jobApplication.create({
      data: {
        jobId: Number(jobId),
        fullNameAr,
        fullNameEn,
        email,
        phone,
        coverLetter,
        cvUrl: `/uploads/${req.file.filename}`,
        portfolioUrl,
        linkedInUrl,
      },
    });

    res.status(201).json({ item: application });
  })
);

// GET /api/careers/applications — admin only
router.get(
  '/applications',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req: Request, res: Response) => {
    const jobId = req.query.jobId ? Number(req.query.jobId) : undefined;
    const status = req.query.status as string | undefined;
    const skip = Number(req.query.skip || 0);
    const take = Math.min(Number(req.query.take || 50), 100);

    const where: Record<string, unknown> = {};
    if (jobId) where.jobId = jobId;
    if (status) where.status = status;

    const [total, items] = await Promise.all([
      prisma.jobApplication.count({ where }),
      prisma.jobApplication.findMany({
        where,
        include: { job: { select: { titleAr: true, titleEn: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);

    res.json({ total, items });
  })
);

// PATCH /api/careers/applications/:id/status — admin only
router.patch(
  '/applications/:id/status',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { status } = req.body;

    const validStatuses = ['PENDING', 'REVIEWED', 'SHORTLISTED', 'REJECTED', 'HIRED'];
    if (!validStatuses.includes(status)) {
      throw new ValidationError(`Status must be one of: ${validStatuses.join(', ')}`);
    }

    const application = await prisma.jobApplication.update({
      where: { id },
      data: { status },
    });

    res.json({ item: application });
  })
);

// ============ ADMIN JOB MANAGEMENT ============

// GET /api/careers/admin/jobs — admin list all jobs
router.get(
  '/admin/jobs',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req: Request, res: Response) => {
    const skip = Number(req.query.skip || 0);
    const take = Math.min(Number(req.query.take || 100), 200);

    const [total, items] = await Promise.all([
      prisma.job.count(),
      prisma.job.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ]);

    res.json({ total, items });
  })
);

// POST /api/careers/admin/jobs — admin create job
router.post(
  '/admin/jobs',
  requireAuth,
  requireRole('ADMIN'),
  validate(schemas.createJob),
  asyncHandler(async (req: Request, res: Response) => {
    const data = req.body;

    const slug = data.slug || data.titleEn
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const job = await prisma.job.create({
      data: {
        titleAr: data.titleAr,
        titleEn: data.titleEn,
        slug,
        departmentAr: data.departmentAr,
        departmentEn: data.departmentEn,
        locationAr: data.locationAr,
        locationEn: data.locationEn,
        typeAr: data.typeAr,
        typeEn: data.typeEn,
        descriptionAr: data.descriptionAr || null,
        descriptionEn: data.descriptionEn || null,
        requirementsAr: data.requirementsAr || null,
        requirementsEn: data.requirementsEn || null,
        salaryMin: data.salaryMin || null,
        salaryMax: data.salaryMax || null,
        status: data.status || 'PUBLISHED',
        expiresAt: data.expiresAt || null,
      },
    });

    res.status(201).json({ item: job });
  })
);

// PUT /api/careers/admin/jobs/:id — admin update job
router.put(
  '/admin/jobs/:id',
  requireAuth,
  requireRole('ADMIN'),
  validate(schemas.createJob),
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const data = req.body;

    const job = await prisma.job.update({
      where: { id },
      data: {
        titleAr: data.titleAr,
        titleEn: data.titleEn,
        departmentAr: data.departmentAr,
        departmentEn: data.departmentEn,
        locationAr: data.locationAr,
        locationEn: data.locationEn,
        typeAr: data.typeAr,
        typeEn: data.typeEn,
        descriptionAr: data.descriptionAr || null,
        descriptionEn: data.descriptionEn || null,
        requirementsAr: data.requirementsAr || null,
        requirementsEn: data.requirementsEn || null,
        salaryMin: data.salaryMin || null,
        salaryMax: data.salaryMax || null,
        status: data.status || 'PUBLISHED',
        expiresAt: data.expiresAt || null,
      },
    });

    res.json({ item: job });
  })
);

export default router;
