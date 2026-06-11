const { ok, fail, cors } = require('../_lib/response');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.end();

  try {
    let body = req.body;

    if (!body) {
      let raw = '';
      for await (const chunk of req) {
        raw += chunk;
      }
      try {
        body = raw ? JSON.parse(raw) : {};
      } catch {
        body = { _raw: raw.substring(0, 200) };
      }
    }

    ok(res, {
      method: req.method,
      url: req.url,
      hasBody: !!body,
      bodyKeys: Object.keys(body),
      contentType: req.headers['content-type'],
      body,
    });
  } catch (err) {
    fail(res, err.message, 500);
  }
};
