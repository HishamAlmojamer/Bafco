const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  const checks = {};
  const cwd = process.cwd();

  // Generated client directory
  const genDir = path.join(cwd, 'node_modules', '.prisma', 'client');
  checks.genDirExists = fs.existsSync(genDir);
  if (checks.genDirExists) {
    checks.genFiles = fs.readdirSync(genDir);
    // default.js
    const def = path.join(genDir, 'default.js');
    if (fs.existsSync(def)) {
      const content = fs.readFileSync(def, 'utf-8');
      checks.defaultSize = content.length;
      checks.defaultFirst200 = content.substring(0, 200);
      checks.hasRealClient = content.includes('getPrismaClient') || content.length > 50000;
      checks.isStub = content.includes('did not initialize yet');
    }
    // Check for engine binary
    const engineFiles = fs.readdirSync(genDir).filter(f => f.includes('engine') || f.includes('libquery'));
    checks.engineFiles = engineFiles;
  }

  // @prisma/client package
  const pkgDir = path.join(cwd, 'node_modules', '@prisma', 'client');
  if (fs.existsSync(pkgDir)) {
    checks.pkgFiles = fs.readdirSync(pkgDir).slice(0, 20);
    // Check package.json for version
    const pkgJson = path.join(pkgDir, 'package.json');
    if (fs.existsSync(pkgJson)) {
      checks.clientVersion = JSON.parse(fs.readFileSync(pkgJson, 'utf-8')).version;
    }
    // Check runtime directory
    const runtimeDir = path.join(pkgDir, 'runtime');
    checks.runtimeExists = fs.existsSync(runtimeDir);
  }

  // prisma CLI package
  const prismaDir = path.join(cwd, 'node_modules', 'prisma');
  checks.prismaExists = fs.existsSync(prismaDir);
  if (checks.prismaExists) {
    checks.prismaSubdirs = fs.readdirSync(prismaDir);
  }

  // .bin directory
  const binDir = path.join(cwd, 'node_modules', '.bin');
  checks.binDirExists = fs.existsSync(binDir);
  if (checks.binDirExists) {
    checks.binFiles = fs.readdirSync(binDir);
  }

  checks.cwd = cwd;

  res.statusCode = 200;
  res.end(JSON.stringify(checks, null, 2));
};
