const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  try {
    const info = {};

    info.cwd = process.cwd();
    info.nodeVersion = process.version;

    const prismaClientDir = path.dirname(require.resolve('@prisma/client'));
    info.prismaClientDir = prismaClientDir;

    const paths = {};
    paths.oneLevelUp = path.join(prismaClientDir, '..', '.prisma', 'client');
    paths.twoLevelsUp = path.join(prismaClientDir, '..', '..', '.prisma', 'client');
    paths.prismaModuleDotPrisma = path.join(prismaClientDir, '..', '.prisma');
    paths.rootNodeModulesDotPrisma = path.join(prismaClientDir, '..', '..', '.prisma');

    for (const [key, p] of Object.entries(paths)) {
      info[key] = {
        path: p,
        exists: fs.existsSync(p),
      };
      if (fs.existsSync(p)) {
        try { info[key].contents = fs.readdirSync(p); } catch (e) { info[key].contents = e.message; }
      }
    }

    info.rootNodeModules = fs.readdirSync(path.join(process.cwd(), 'node_modules')).filter(f => f.startsWith('.') || f.startsWith('@'));

    res.statusCode = 200;
    res.end(JSON.stringify(info, null, 2));
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err.message, stack: err.stack }));
  }
};
