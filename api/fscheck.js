const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  const checks = {};
  const cwd = process.cwd();

  const generatedClientDir = path.join(cwd, 'node_modules', '.prisma', 'client');
  checks.generatedClientExists = fs.existsSync(generatedClientDir);
  if (checks.generatedClientExists) {
    checks.generatedClientFiles = fs.readdirSync(generatedClientDir);
    const indexPath = path.join(generatedClientDir, 'index.js');
    if (fs.existsSync(indexPath)) {
      checks.indexContent = fs.readFileSync(indexPath, 'utf-8').substring(0, 2000);
    }
  }

  const prismaClientDir = path.join(cwd, 'node_modules', '@prisma', 'client');
  checks.prismaClientPackageExists = fs.existsSync(prismaClientDir);
  if (checks.prismaClientPackageExists) {
    checks.prismaClientFiles = fs.readdirSync(prismaClientDir).slice(0, 15);
    const pkgIndex = path.join(prismaClientDir, 'index.js');
    if (fs.existsSync(pkgIndex)) {
      checks.pkgIndexContent = fs.readFileSync(pkgIndex, 'utf-8').substring(0, 2000);
    }
  }

  const schemaPath = path.join(cwd, 'server', 'prisma', 'schema.prisma');
  checks.schemaExists = fs.existsSync(schemaPath);
  if (checks.schemaExists) {
    checks.schemaContent = fs.readFileSync(schemaPath, 'utf-8');
  }

  checks.cwd = cwd;

  // Check if prisma CLI is present
  const prismaDir = path.join(cwd, 'node_modules', 'prisma');
  checks.prismaExists = fs.existsSync(prismaDir);

  res.statusCode = 200;
  res.end(JSON.stringify(checks, null, 2));
};
