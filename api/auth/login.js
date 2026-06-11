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
    let prismaOk = false;
    let prismaError = null;
    try {
      const { prisma } = require('../_lib/prisma');
      await prisma.$connect();
      prismaOk = true;
      await prisma.$disconnect();
    } catch (e) {
      prismaError = e.message;
    }

    ok(res, { prismaOk, prismaError, message: 'login test' });
  } catch (err) {
    fail(res, 'Error: ' + err.message, 500);
  }
};
