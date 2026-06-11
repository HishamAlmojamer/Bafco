const { ok, fail, cors } = require('../_lib/response');
const prismaModule = require('../_lib/prisma');

module.exports = (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.end();
  if (req.method !== 'POST') { fail(res, 'Method not allowed', 405); return; }

  try {
    const prismaInfo = {
      hasPrismaClient: !!prismaModule.prisma,
      initError: prismaModule.initError || null,
    };

    res.statusCode = 200;
    res.end(JSON.stringify({
      method: req.method,
      email: req.body?.email || null,
      prisma: prismaInfo,
    }));
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err.message, stack: err.stack }));
  }
};
