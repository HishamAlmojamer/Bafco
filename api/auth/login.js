const { ok, fail, cors } = require('../_lib/response');

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
    let steps = ['has-body: ' + (!!req.body), 'has-rawBody: ' + (!!req.rawBody), 'method: ' + req.method];

    let body;
    if (req.body) {
      body = req.body;
      steps.push('used-req-body');
    } else {
      let raw = '';
      await new Promise((resolve, reject) => {
        req.on('data', chunk => { raw += chunk; });
        req.on('end', resolve);
        req.on('error', reject);
      });
      body = JSON.parse(raw);
      steps.push('used-manual-parse');
    }

    const { email, password } = body;
    steps.push('email: ' + !!email, 'password: ' + !!password);

    let prismaClient;
    try {
      const p = require('../_lib/prisma');
      prismaClient = p.prisma;
      steps.push('prisma-imported');
    } catch (e) {
      steps.push('prisma-import-fail:' + e.message);
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

    ok(res, { steps });
  } catch (err) {
    fail(res, 'Error: ' + err.message, 500);
  }
};
