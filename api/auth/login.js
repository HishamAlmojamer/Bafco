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
    let steps = [];
    steps.push('body=' + typeof req.body);
    steps.push('rawBody=' + typeof req.rawBody);
    steps.push('headers-ct=' + req.headers['content-type']);
    steps.push('readable=' + req.readable);
    steps.push('destroyed=' + req.destroyed);
    steps.push('method=' + req.method);

    let buf = Buffer.alloc(0);
    for await (const chunk of req) {
      buf = Buffer.concat([buf, chunk]);
    }
    const raw = buf.toString('utf8');
    steps.push('raw-len=' + raw.length + ' raw=' + raw.substring(0, 100));

    let body;
    try {
      body = JSON.parse(raw);
      steps.push('parsed=ok');
    } catch (e) {
      steps.push('parse-error=' + e.message);
    }

    ok(res, { steps });
  } catch (err) {
    fail(res, 'Error: ' + err.message, 500);
  }
};
