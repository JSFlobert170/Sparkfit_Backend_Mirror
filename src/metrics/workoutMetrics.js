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
    }),

    // Compteur total de créations de workouts
    creationTotal: new client.Counter({
        name: 'sparkfit_workout_creation_total',
        help: 'Nombre total de workouts créés',
        registers: [register]
    }),

    // Histogramme des durées des workouts
    duration: new client.Histogram({
        name: 'sparkfit_workout_duration_minutes',
        help: 'Distribution des durées des workouts en minutes',
        buckets: [15, 30, 45, 60, 90, 120],
        registers: [register]
    }),

    // Histogramme des calories brûlées
    caloriesBurned: new client.Histogram({
        name: 'sparkfit_workout_calories_burned',
        help: 'Distribution des calories brûlées par workout',
        buckets: [100, 200, 300, 400, 500, 750, 1000],
        registers: [register]
    })
};

module.exports = {
    register,
    workoutMetrics
}; 