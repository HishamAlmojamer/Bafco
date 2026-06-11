const { query } = require('../_lib/db');
const { extractUser } = require('../_lib/jwt');
const { ok, fail, cors } = require('../_lib/response');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.end();
  if (req.method !== 'GET') { fail(res, 'Method not allowed', 405); return; }

  try {
    const userData = extractUser(req);
    if (!userData) { fail(res, 'Unauthorized', 401); return; }

    const result = await query('SELECT id, email, name, phone, role, address FROM "User" WHERE id = $1', [userData.sub]);
    if (result.rows.length === 0) { fail(res, 'User not found', 404); return; }

    ok(res, { user: result.rows[0] });
  } catch (err) {
    fail(res, err.message, 500);
  }
};
