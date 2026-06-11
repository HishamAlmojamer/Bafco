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

    let steps = [];

    let prismaClient;
    try {
      const p = require('../_lib/prisma');
      prismaClient = p.prisma;
      steps.push('prisma-imported');
    } catch (e) {
      steps.push('prisma-import-fail:' + e.message);
    }

    let bcryptjs;
    try {
      bcryptjs = require('bcryptjs');
      steps.push('bcrypt-imported');
    } catch (e) {
      steps.push('bcrypt-import-fail:' + e.message);
    }

    let jwt;
    try {
      jwt = require('../_lib/jwt');
      steps.push('jwt-imported');
    } catch (e) {
      steps.push('jwt-import-fail:' + e.message);
    }

    if (prismaClient) {
      try {
        await prismaClient.$connect();
        steps.push('prisma-connected');
        await prismaClient.$disconnect();
      } catch (e) {
        steps.push('prisma-connect-fail:' + e.message);
      }
    }

    ok(res, { steps, email, password: !!password });
  } catch (err) {
    fail(res, 'Error: ' + err.message, 500);
  }
};
