const { prisma } = require('../_lib/prisma');
const { extractUser } = require('../_lib/jwt');
const { ok, fail, cors } = require('../_lib/response');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.end();
  if (req.method !== 'GET') { fail(res, 'Method not allowed', 405); return; }

  try {
    const user = extractUser(req);
    if (!user) { fail(res, 'Missing authentication token', 401); return; }

    if (!prisma) {
      fail(res, 'System configuration error (database not available). Please contact the administrator.', 503);
      return;
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.sub },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    if (!dbUser) { fail(res, 'User not found', 401); return; }

    ok(res, { user: dbUser });
  } catch (err) {
    fail(res, err.message, 500);
  }
};
