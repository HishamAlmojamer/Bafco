let PrismaClient;
try {
  PrismaClient = require('@prisma/client').PrismaClient;
} catch (e) {
  PrismaClient = null;
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
    console.error('Failed to create PrismaClient:', e.message);
  }
}

module.exports = { prisma };
