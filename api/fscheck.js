const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  const checks = {};

  // Check if node_modules/.prisma/client exists
  const generatedClientDir = path.join(process.cwd(), 'node_modules', '.prisma', 'client');
  checks.generatedClientExists = fs.existsSync(generatedClientDir);
  if (checks.generatedClientExists) {
    checks.generatedClientFiles = fs.readdirSync(generatedClientDir);
  }

  // Check if @prisma/client package exists
  const prismaClientDir = path.join(process.cwd(), 'node_modules', '@prisma', 'client');
  checks.prismaClientPackageExists = fs.existsSync(prismaClientDir);
  if (checks.prismaClientPackageExists) {
    checks.prismaClientFiles = fs.readdirSync(prismaClientDir).slice(0, 10);
  }

  // Check schema file
  const schemaPath = path.join(process.cwd(), 'server', 'prisma', 'schema.prisma');
  checks.schemaExists = fs.existsSync(schemaPath);
  if (checks.schemaExists) {
    checks.schemaContent = fs.readFileSync(schemaPath, 'utf-8').split('\n').slice(0, 8).join('\n');
  }

  checks.cwd = process.cwd();

  res.statusCode = 200;
  res.end(JSON.stringify(checks, null, 2));
};
