module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    // Test pg import
    let pgWorks = false;
    try {
      const { Pool } = require('pg');
      pgWorks = !!Pool;
    } catch (e) {
      res.statusCode = 200;
      res.end(JSON.stringify({ error: 'pg import failed: ' + e.message }));
      return;
    }

    // Test db module
    let dbWorks = false;
    try {
      const db = require('../_lib/db');
      dbWorks = !!db.query;
    } catch (e) {
      res.statusCode = 200;
      res.end(JSON.stringify({ error: 'db import failed: ' + e.message }));
      return;
    }

    // Test connection
    let connWorks = false;
    try {
      const db = require('../_lib/db');
      const result = await db.query('SELECT 1 as val');
      connWorks = result.rows[0].val === 1;
    } catch (e) {
      res.statusCode = 200;
      res.end(JSON.stringify({ error: 'query failed: ' + e.message }));
      return;
    }

    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, pgWorks, dbWorks, connWorks }));
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ fatal: err.message, stack: err.stack }));
  }
};
