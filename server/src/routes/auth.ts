import { Router, Request, Response } from 'express';
import { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { config } from '../config';
import { asyncHandler, ValidationError, UnauthorizedError } from '../utils/errors';
import { validate, schemas } from '../middleware/validate';
import { requireAuth, requireRole } from '../middleware/auth';

const router: Router = Router();

router.post(
  '/login',
  validate(schemas.login),
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = jwt.sign(
      { sub: user.id, role: user.role, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn } as SignOptions
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  })
);

router.post(
  '/register',
  validate(schemas.register),
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name, phone } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ValidationError('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, name, phone, role: 'CUSTOMER' },
    });

    const token = jwt.sign(
      { sub: user.id, role: user.role, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn } as SignOptions
    );

    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role },
    });
  })
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.sub },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    res.json({ user });
  })
);

export default router;
