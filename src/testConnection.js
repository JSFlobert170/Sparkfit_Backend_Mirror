const prisma = require('./postgresConnection');

async function testConnection() {
  try {
    // Test de connexion basique
    await prisma.$connect();
    console.log('✅ Connexion à la base de données réussie');

    // Test de requête simple
    const userCount = await prisma.user.count();
    console.log('✅ Requête test réussie');
    console.log(`Nombre d'utilisateurs dans la base : ${userCount}`);

    // Test des tables disponibles
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('\n📋 Tables disponibles dans la base de données :');
    tables.forEach(table => console.log(`- ${table.table_name}`));

  } catch (error) {
    console.error('❌ Erreur lors du test de connexion :', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Déconnexion de la base de données');
  }
}

testConnection(); 