const { prisma } = require('../_lib/prisma');
const { ok, fail, cors } = require('../_lib/response');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.end();

  try {
    await prisma.$connect();
    const users = await prisma.user.count();
    await prisma.$disconnect();
    ok(res, { status: 'ok', users, timestamp: new Date().toISOString() });
  } catch (err) {
    fail(res, err.message, 500);
  }
};
