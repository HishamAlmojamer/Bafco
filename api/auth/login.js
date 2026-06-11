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
    const { email, password } = body;

    if (!email || !password) {
      fail(res, 'Email and password are required');
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
    console.error('Login error:', err);
    fail(res, err.message || 'Internal server error', 500);
  }
};
