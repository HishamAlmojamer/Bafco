const bcrypt = require('bcryptjs');
const { prisma } = require('../_lib/prisma');
const { signToken } = require('../_lib/jwt');
const { ok, fail, cors } = require('../_lib/response');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.end();
  if (req.method !== 'POST') { fail(res, 'Method not allowed', 405); return; }

  try {
    const { email, password, name, phone } = req.body || {};
    if (!email || !password || !name) { fail(res, 'Email, password, and name are required'); return; }

    if (!prisma) {
      fail(res, 'System configuration error: ' + (require('../_lib/prisma').initError || 'prisma not available'), 503);
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) { fail(res, 'Email already registered', 409); return; }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, name, phone: phone || null, role: 'CUSTOMER' },
    });

    const token = signToken({ sub: user.id, role: user.role, email: user.email });
    ok(res, { token, user: { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role } }, 201);
  } catch (err) {
    fail(res, err.message, 500);
  }
};
