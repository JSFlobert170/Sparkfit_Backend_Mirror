const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const app = require('../src/app');
const { cleanupInterval } = require('../src/controllers/login.controller');
let server;

beforeAll(async () => {
  // Vérifier la connexion à la base de données
  try {
    await prisma.$connect();
    // Démarrer le serveur sur un port de test différent
    process.env.PORT = 3001; // Port différent pour les tests
    server = app.listen(process.env.PORT);
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error);
    process.exit(1);
  }
});

beforeEach(async () => {
  // Nettoyer la base de données avant chaque test
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  // Fermer la connexion à la base de données et le serveur
  await prisma.$disconnect();
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  // Nettoyer l'intervalle de nettoyage des sessions
  clearInterval(cleanupInterval);
}); 