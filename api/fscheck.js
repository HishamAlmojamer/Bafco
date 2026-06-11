const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  const checks = {};
  const cwd = process.cwd();

  const generatedClientDir = path.join(cwd, 'node_modules', '.prisma', 'client');
  checks.generatedClientDir = generatedClientDir;
  checks.generatedClientExists = fs.existsSync(generatedClientDir);
  if (checks.generatedClientExists) {
    checks.generatedClientFiles = fs.readdirSync(generatedClientDir);
    // Check default.js content (the real client)
    const defaultPath = path.join(generatedClientDir, 'default.js');
    if (fs.existsSync(defaultPath)) {
      const content = fs.readFileSync(defaultPath, 'utf-8');
      checks.defaultSize = content.length;
      checks.defaultStartsWith = content.substring(0, 500);
      // Check if PrismaClient exists in default.js
      checks.hasPrismaClientClass = content.includes('class PrismaClient');
      checks.hasGenerateMessage = content.includes('did not initialize yet');
    }
  }

  const schemaPath = path.join(cwd, 'server', 'prisma', 'schema.prisma');
  checks.schemaExists = fs.existsSync(schemaPath);
  if (checks.schemaExists) {
    // Just check first 8 lines
    checks.schemaHead = fs.readFileSync(schemaPath, 'utf-8').split('\n').slice(0, 8).join('\n');
  }

  checks.cwd = cwd;

  res.statusCode = 200;
  res.end(JSON.stringify(checks, null, 2));
};
