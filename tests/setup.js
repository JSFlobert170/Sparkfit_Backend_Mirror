const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const app = require('../src/app');
const { cleanupInterval } = require('../src/controllers/login.controller');
let server;

// Configuration des variables d'environnement pour les tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.PORT = '3001';

beforeAll(async () => {
  // Vérifier la connexion à la base de données
  try {
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    await prisma.$connect();
    server = app.listen(process.env.PORT);
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error);
    process.exit(1);
  }
});

afterAll(async () => {
  // Fermer la connexion à la base de données et le serveur
  await prisma.$disconnect();
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  // Nettoyer l'intervalle de nettoyage des sessions
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
  }
});
