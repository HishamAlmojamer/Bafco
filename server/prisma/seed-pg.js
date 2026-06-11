const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function seed() {
  const hash = await bcrypt.hash('Admin@12345', 12);

  const user = await pool.query(
    'INSERT INTO "User" (email, "passwordHash", name, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW()) ON CONFLICT (email) DO UPDATE SET "passwordHash" = $2 RETURNING id, email, role',
    ['admin@bafco.com', hash, 'Admin', 'ADMIN']
  );
  console.log('Admin user:', JSON.stringify(user.rows[0]));

  const catResult = await pool.query(
    'INSERT INTO "Category" ("nameAr", "nameEn", slug, "sortOrder", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW()) ON CONFLICT (slug) DO NOTHING RETURNING id',
    ['العامة', 'General', 'general', 0]
  );
  console.log('Category:', JSON.stringify(catResult.rows[0] || { exists: true }));

  await pool.end();
  console.log('Seed completed!');
}

seed().catch(err => { console.error('Seed error:', err.message); process.exit(1); });
