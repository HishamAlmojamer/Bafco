const bcrypt = require('bcryptjs');
const { prisma } = require('../_lib/prisma');
const { signToken } = require('../_lib/jwt');
const { ok, fail, cors } = require('../_lib/response');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.end();
  if (req.method !== 'POST') { fail(res, 'Method not allowed', 405); return; }

  try {
    const { email, password } = req.body || {};
    if (!email || !password) { fail(res, 'Email and password are required'); return; }

    if (!prisma) {
      fail(res, 'System configuration error (database not available). Please contact the administrator.', 503);
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) { fail(res, 'Invalid email or password', 401); return; }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) { fail(res, 'Invalid email or password', 401); return; }

    const token = signToken({ sub: user.id, role: user.role, email: user.email });
    ok(res, { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    fail(res, err.message, 500);
  }
};
