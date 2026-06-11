const bcrypt = require('bcryptjs');
const { query } = require('../_lib/db');
const { signToken } = require('../_lib/jwt');
const { ok, fail, cors } = require('../_lib/response');

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.end();
  if (req.method !== 'POST') { fail(res, 'Method not allowed', 405); return; }

  try {
    const { email, password, name, phone } = req.body || {};
    if (!email || !password || !name) { fail(res, 'Email, password, and name are required'); return; }

    const existing = await query('SELECT id FROM "User" WHERE email = $1', [email]);
    if (existing.rows.length > 0) { fail(res, 'Email already registered', 409); return; }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await query(
      'INSERT INTO "User" (email, "passwordHash", name, phone, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id, email, name, phone, role',
      [email, passwordHash, name, phone || null, 'CUSTOMER']
    );

    const user = result.rows[0];
    const token = signToken({ sub: user.id, role: user.role, email: user.email });
    ok(res, { token, user: { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role } }, 201);
  } catch (err) {
    fail(res, err.message, 500);
  }
};
