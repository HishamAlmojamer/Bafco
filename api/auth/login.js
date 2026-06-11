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

    if (!email || !password) {
      fail(res, 'Email and password required as query params');
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      fail(res, 'Invalid email or password', 401);
      return;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      fail(res, 'Invalid email or password', 401);
      return;
    }

    const token = signToken({ sub: user.id, role: user.role, email: user.email });

    ok(res, {
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    fail(res, err.message, 500);
  }
};
