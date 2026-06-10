import { Router, Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { asyncHandler, NotFoundError, BadRequestError } from '../utils/errors';
import { requireAuth } from '../middleware/auth';

const router: Router = Router();

// GET /api/cart — get current user's cart
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.sub;

    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: { include: { category: true } },
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: { include: { category: true } },
            },
          },
        },
      });
    }

    res.json(cart);
  })
);

// POST /api/cart/items — add item to cart
router.post(
  '/items',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.sub;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      throw new BadRequestError('Product ID is required');
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new NotFoundError('Product');
    }

    // Ensure cart exists
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    // Upsert cart item
    const existing = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    const updated = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: { include: { category: true } },
          },
        },
      },
    });

    res.json(updated);
  })
);

// PUT /api/cart/items/:id — update item quantity
router.put(
  '/items/:id',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.sub;
    const itemId = Number(req.params.id);
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      throw new BadRequestError('Quantity must be at least 1');
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      throw new NotFoundError('Cart item');
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: { include: { category: true } },
          },
        },
      },
    });

    res.json(cart);
  })
);

// DELETE /api/cart/items/:id — remove item from cart
router.delete(
  '/items/:id',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.sub;
    const itemId = Number(req.params.id);

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      throw new NotFoundError('Cart item');
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: { include: { category: true } },
          },
        },
      },
    });

    res.json(cart);
  })
);

export default router;
