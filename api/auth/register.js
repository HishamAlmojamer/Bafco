const bcrypt = require('bcryptjs');
const { prisma } = require('../_lib/prisma');
const { signToken } = require('../_lib/jwt');
const { ok, fail, cors, parseBody } = require('../_lib/response');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    fail(res, 'Method not allowed', 405);
    return;
  }

  try {
    const body = await parseBody(req);
    const { email, password, name, phone } = body;

    if (!email || !password || !name) {
      fail(res, 'Email, password, and name are required');
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
      data: { email, passwordHash, name, phone: phone || null, role: 'CUSTOMER' },
    });

    const token = signToken({ sub: user.id, role: user.role, email: user.email });

    ok(res, {
      token,
      user: { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role },
    }, 201);
  } catch (err) {
    console.error('Register error:', err);
    fail(res, 'Internal server error', 500);
  }
};
