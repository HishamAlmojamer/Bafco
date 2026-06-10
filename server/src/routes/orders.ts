import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { asyncHandler, NotFoundError, BadRequestError } from '../utils/errors';
import { requireAuth, requireRole } from '../middleware/auth';

const router: Router = Router();

// POST /api/orders — create order from cart (customer only)
router.post(
  '/',
  requireAuth,
  requireRole('ADMIN', 'CUSTOMER'),
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.sub;
    const { notes } = req.body;

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestError('Cart is empty');
    }

    const total = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    const order = await prisma.order.create({
      data: {
        userId,
        total,
        notes: notes || null,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    // Clear cart after order
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    res.status(201).json({ item: order });
  })
);

// GET /api/orders — list orders
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.sub;
    const role = req.user!.role;

    const where = role === 'ADMIN' ? {} : { userId };

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: { product: true },
        },
        user: role === 'ADMIN' ? { select: { id: true, name: true, email: true, phone: true } } : false,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ items: orders });
  })
);

// GET /api/orders/:id — get single order
router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.sub;
    const role = req.user!.role;
    const id = Number(req.params.id);

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true },
        },
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    if (!order) {
      throw new NotFoundError('Order');
    }

    if (role !== 'ADMIN' && order.userId !== userId) {
      throw new NotFoundError('Order');
    }

    res.json({ item: order });
  })
);

// PUT /api/orders/:id/status — update order status (admin only)
router.put(
  '/:id/status',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const { status } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestError(`Status must be one of: ${validStatuses.join(', ')}`);
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundError('Order');

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: { include: { product: true } },
      },
    });

    res.json({ item: updated });
  })
);

export default router;
