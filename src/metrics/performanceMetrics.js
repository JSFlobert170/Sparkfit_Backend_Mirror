const client = require('prom-client');
const register = new client.Registry();

// Métriques de performance
const performanceMetrics = {
    // Métriques API
    apiLatency: new client.Histogram({
        name: 'sparkfit_api_latency_seconds',
        help: 'Latence des endpoints API en secondes',
        labelNames: ['endpoint', 'method'],
        buckets: [0.01, 0.05, 0.1, 0.5, 1],
        registers: [register]
    }),

    apiErrors: new client.Counter({
        name: 'sparkfit_api_errors_total',
        help: 'Nombre total d\'erreurs par endpoint',
        labelNames: ['endpoint', 'method', 'status'],
        registers: [register]
    }),

    apiActiveRequests: new client.Gauge({
        name: 'sparkfit_api_active_requests',
        help: 'Nombre de requêtes actives',
        labelNames: ['endpoint'],
        registers: [register]
    }),

    // Métriques DB
    dbQueryLatency: new client.Histogram({
        name: 'sparkfit_db_query_duration_seconds',
        help: 'Temps d\'exécution des requêtes DB en secondes',
        labelNames: ['query_type', 'table'],
        buckets: [0.01, 0.05, 0.1, 0.5, 1],
        registers: [register]
    }),

    dbActiveConnections: new client.Gauge({
        name: 'sparkfit_db_connections_active',
        help: 'Nombre de connexions actives à la base de données',
        registers: [register]
    }),

    dbQueryTotal: new client.Counter({
        name: 'sparkfit_db_queries_total',
        help: 'Nombre total de requêtes exécutées',
        labelNames: ['query_type', 'table'],
        registers: [register]
    }),

    dbQueryErrors: new client.Counter({
        name: 'sparkfit_db_query_errors_total',
        help: 'Nombre total d\'erreurs de base de données',
        labelNames: ['query_type', 'table', 'error_code'],
        registers: [register]
    }),

    dbSize: new client.Gauge({
        name: 'sparkfit_db_size_bytes',
        help: 'Taille totale de la base de données en bytes',
        registers: [register]
    }),

    dbTableSize: new client.Gauge({
        name: 'sparkfit_db_table_size_bytes',
        help: 'Taille des tables en bytes',
        labelNames: ['table'],
        registers: [register]
    })
};

module.exports = {
    register,
    performanceMetrics
}; 