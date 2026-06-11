const { prisma } = require('../_lib/prisma');
const bcrypt = require('bcryptjs');
const { signToken } = require('../_lib/jwt');
const { ok, fail, cors } = require('../_lib/response');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.end();

  try {
    if (!prisma) {
      fail(res, 'Database not configured. Set DATABASE_URL environment variable.', 500);
      return;
    }

    const query = new URL(req.url, 'http://x').searchParams;
    const email = query.get('email');
    const password = query.get('password');
    const name = query.get('name') || '';
    const phone = query.get('phone') || '';

    if (!email || !password || !name) {
      fail(res, 'Email, password, and name required');
      return;
    }

    if (password.length < 6) {
      fail(res, 'Password must be at least 6 characters');
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      fail(res, 'Email already registered', 409);
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, name, phone, role: 'CUSTOMER' },
    });

    const token = signToken({ sub: user.id, role: user.role, email: user.email });

    ok(res, { token, user: { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role } }, 201);
  } catch (err) {
    fail(res, err.message, 500);
  }
};
