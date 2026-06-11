const { ok, fail, cors } = require('../_lib/response');

module.exports = (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.end();
  if (req.method !== 'POST') { fail(res, 'Method not allowed', 405); return; }

  try {
    res.statusCode = 200;
    res.end(JSON.stringify({
      method: req.method,
      hasBody: !!req.body,
      bodyType: typeof req.body,
      keys: req.body ? Object.keys(req.body) : [],
      email: req.body?.email || null,
    }));
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err.message }));
  }
};
