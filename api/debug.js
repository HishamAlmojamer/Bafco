const prismaModule = require('./_lib/prisma');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  try {
    const info = {
      env: {
        databaseUrl_set: !!process.env.DATABASE_URL,
        databaseUrl_len: process.env.DATABASE_URL ? process.env.DATABASE_URL.length : 0,
        jwtSecret_set: !!process.env.JWT_SECRET,
        nodeEnv: process.env.NODE_ENV,
      },
      prisma: {
        hasClient: !!prismaModule.prisma,
        initError: prismaModule.initError || null,
      },
    };

    if (prismaModule.prisma) {
      try {
        const result = await prismaModule.prisma.$queryRaw`SELECT 1 as val`;
        info.dbTest = { ok: true, result };
      } catch (dbErr) {
        info.dbTest = { ok: false, error: dbErr.message, code: dbErr.code };
      }
    }

    res.statusCode = 200;
    res.end(JSON.stringify(info, null, 2));
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err.message, stack: err.stack }));
  }
};
