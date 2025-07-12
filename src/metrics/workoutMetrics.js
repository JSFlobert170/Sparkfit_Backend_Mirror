const client = require('prom-client');
const register = new client.Registry();

// Métriques de performance du backend
const workoutMetrics = {
    // Latence des endpoints API
    apiLatency: new client.Histogram({
        name: 'sparkfit_api_latency_seconds',
        help: 'Latence des endpoints API en secondes',
        labelNames: ['endpoint', 'method'],
        buckets: [0.01, 0.05, 0.1, 0.5, 1],
        registers: [register]
    }),

    // Compteur d'erreurs par endpoint
    apiErrors: new client.Counter({
        name: 'sparkfit_api_errors_total',
        help: 'Nombre total d\'erreurs par endpoint',
        labelNames: ['endpoint', 'method', 'status'],
        registers: [register]
    }),

    // Requêtes actives
    activeRequests: new client.Gauge({
        name: 'sparkfit_api_active_requests',
        help: 'Nombre de requêtes actives',
        labelNames: ['endpoint'],
        registers: [register]
    })
};

module.exports = {
    register,
    workoutMetrics
}; 