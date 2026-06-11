const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  try {
    const info = {};

    info.cwd = process.cwd();
    info.nodeVersion = process.version;

    info.prismaClientPath = require.resolve('@prisma/client');
    info.prismaClientDir = path.dirname(require.resolve('@prisma/client'));

    const dotPrismaDir = path.join(info.prismaClientDir, '..', '.prisma', 'client');
    info.dotPrismaClientExists = fs.existsSync(dotPrismaDir);
    if (info.dotPrismaClientExists) {
      info.dotPrismaFiles = fs.readdirSync(dotPrismaDir);
    }

    info.prismaModuleDir = path.join(info.prismaClientDir, '..', '.prisma');
    if (fs.existsSync(info.prismaModuleDir)) {
      info.prismaModuleContents = fs.readdirSync(info.prismaModuleDir);
    }

    info.rootNodeModules = fs.readdirSync(path.join(process.cwd(), 'node_modules')).filter(f => f.startsWith('.') || f.startsWith('@'));

    res.statusCode = 200;
    res.end(JSON.stringify(info, null, 2));
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err.message, stack: err.stack }));
  }
};
