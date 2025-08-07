const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
  const healthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: 'ok',
    },
  };

  try {
    // Vérifie la connexion à PostgreSQL via Prisma
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    healthStatus.status = 'error';
    healthStatus.services.database = 'error';
    healthStatus.error = error.message;
    return res.status(500).json(healthStatus);
  }

  res.status(200).json(healthStatus);
});

module.exports = router;
