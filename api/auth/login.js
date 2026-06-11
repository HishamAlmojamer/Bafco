const { query } = require('../_lib/db');
const { ok, fail, cors } = require('../_lib/response');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.end();
  if (req.method !== 'POST') { fail(res, 'Method not allowed', 405); return; }

  try {
    const { email, password } = req.body || {};
    if (!email || !password) { fail(res, 'Email and password are required'); return; }

    const result = await query('SELECT id, email, password_hash, name, role FROM "User" WHERE email = $1', [email]);
    if (result.rows.length === 0) { fail(res, 'User not found', 401); return; }

    const user = result.rows[0];
    ok(res, { found: true, email: user.email, name: user.name, hashPreview: user.password_hash.substring(0, 20) + '...' });
  } catch (err) {
    fail(res, err.message, 500);
  }
};
