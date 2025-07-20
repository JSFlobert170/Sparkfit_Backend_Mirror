const client = require('prom-client');
const register = new client.Registry();

// Métriques de performance de la base de données
const dbMetrics = {
    // Temps de réponse des requêtes DB
    queryLatency: new client.Histogram({
        name: 'sparkfit_db_query_duration_seconds',
        help: 'Temps d\'exécution des requêtes DB en secondes',
        labelNames: ['query_type', 'table'],
        buckets: [0.01, 0.05, 0.1, 0.5, 1],
        registers: [register]
    }),

    // Nombre de connexions actives
    activeConnections: new client.Gauge({
        name: 'sparkfit_db_connections_active',
        help: 'Nombre de connexions actives à la base de données',
        registers: [register]
    }),

    // Nombre total de requêtes
    queryTotal: new client.Counter({
        name: 'sparkfit_db_queries_total',
        help: 'Nombre total de requêtes exécutées',
        labelNames: ['query_type', 'table'],
        registers: [register]
    }),

    // Erreurs de base de données
    queryErrors: new client.Counter({
        name: 'sparkfit_db_query_errors_total',
        help: 'Nombre total d\'erreurs de base de données',
        labelNames: ['query_type', 'table', 'error_code'],
        registers: [register]
    }),

    // Taille de la base de données
    databaseSize: new client.Gauge({
        name: 'sparkfit_db_size_bytes',
        help: 'Taille totale de la base de données en bytes',
        registers: [register]
    }),

    // Taille des tables
    tableSize: new client.Gauge({
        name: 'sparkfit_db_table_size_bytes',
        help: 'Taille des tables en bytes',
        labelNames: ['table'],
        registers: [register]
    })
};

module.exports = {
    register,
    dbMetrics
}; 