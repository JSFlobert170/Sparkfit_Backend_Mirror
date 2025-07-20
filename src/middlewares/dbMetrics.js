const { dbMetrics } = require('../metrics/dbMetrics');
const { PrismaClient } = require('@prisma/client');

// Créer une instance Prisma avec des middlewares pour les métriques
const prisma = new PrismaClient();

// Middleware pour mesurer les performances des requêtes
prisma.$use(async (params, next) => {
    const startTime = process.hrtime();

    try {
        // Incrémenter le compteur de requêtes
        dbMetrics.queryTotal.inc({
            query_type: params.action,
            table: params.model
        });

        // Exécuter la requête
        const result = await next(params);

        // Mesurer la latence
        const [seconds, nanoseconds] = process.hrtime(startTime);
        const duration = seconds + nanoseconds / 1e9;
        dbMetrics.queryLatency.observe({
            query_type: params.action,
            table: params.model
        }, duration);

        return result;
    } catch (error) {
        // Incrémenter le compteur d'erreurs
        dbMetrics.queryErrors.inc({
            query_type: params.action,
            table: params.model,
            error_code: error.code || 'unknown'
        });
        throw error;
    }
});

// Fonction pour mettre à jour les métriques de taille de la base de données
async function updateDBSizeMetrics() {
    try {
        // Requête pour obtenir la taille totale de la base de données
        const dbSizeResult = await prisma.$queryRaw`
            SELECT pg_database_size(current_database()) as size;
        `;
        dbMetrics.databaseSize.set(dbSizeResult[0].size);

        // Requête pour obtenir la taille de chaque table
        const tableSizesResult = await prisma.$queryRaw`
            SELECT relname as table_name,
                   pg_total_relation_size(C.oid) as total_bytes
            FROM pg_class C
            LEFT JOIN pg_namespace N ON (N.oid = C.relnamespace)
            WHERE nspname NOT IN ('pg_catalog', 'information_schema')
              AND C.relkind = 'r'
            ORDER BY total_bytes DESC;
        `;

        tableSizesResult.forEach(row => {
            dbMetrics.tableSize.set({ table: row.table_name }, row.total_bytes);
        });

        // Mettre à jour le nombre de connexions actives
        const activeConnectionsResult = await prisma.$queryRaw`
            SELECT count(*) as count 
            FROM pg_stat_activity 
            WHERE datname = current_database();
        `;
        dbMetrics.activeConnections.set(activeConnectionsResult[0].count);

    } catch (error) {
        console.error('Erreur lors de la mise à jour des métriques DB:', error);
    }
}

// Mettre à jour les métriques toutes les 60 secondes
setInterval(updateDBSizeMetrics, 60000);

// Exécuter une première fois au démarrage
updateDBSizeMetrics();

module.exports = prisma; 