let PrismaClient;
let initError = null;
try {
  PrismaClient = require('@prisma/client').PrismaClient;
} catch (e) {
  PrismaClient = null;
  initError = 'import-error: ' + e.message;
}

const globalForPrisma = globalThis;
let prisma = globalForPrisma.__prisma;

if (!prisma && PrismaClient) {
  try {
    prisma = new PrismaClient({
      log: ['error'],
    });
    globalForPrisma.__prisma = prisma;
  } catch (e) {
    initError = 'new-client-error: ' + e.message;
    console.error('prisma.js: Failed to create PrismaClient:', e.message);
  }
}

module.exports = { prisma, initError };
