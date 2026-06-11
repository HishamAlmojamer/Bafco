const { ok, fail, cors } = require('../_lib/response');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.end();

  try {
    let info = [];

    info.push('typeof req=' + typeof req);
    info.push('isStream=' + !!(req && typeof req.on === 'function'));
    info.push('readable=' + req.readable);
    info.push('readableEnded=' + req.readableEnded);
    info.push('readableFlowing=' + req.readableFlowing);
    info.push('destroyed=' + req.destroyed);
    info.push('body=' + typeof req.body);
    info.push('rawBody=' + typeof req.rawBody);
    info.push('ct=' + req.headers['content-type']);
    info.push('method=' + req.method);

    info.push('hasSymbolAsyncIterator=' + !!(req && req[Symbol.asyncIterator]));

    let raw = '';
    try {
      for await (const chunk of req) {
        raw += chunk;
      }
      info.push('forawait=ok len=' + raw.length);
    } catch (e) {
      info.push('forawait=error: ' + e.message);
    }

    let parsed = {};
    if (raw) {
      try {
        parsed = JSON.parse(raw);
        info.push('json=ok');
      } catch (e) {
        info.push('json=error: ' + e.message);
      }
    } else {
      info.push('json=skipped empty');
    }

    ok(res, { info, parsed });
  } catch (err) {
    fail(res, err.message, 500);
  }
};
