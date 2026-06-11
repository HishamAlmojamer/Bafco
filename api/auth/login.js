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

  ok(res, { message: 'login endpoint works', method: req.method });
};
