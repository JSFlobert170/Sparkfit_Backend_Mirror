const client = require('prom-client');

// Créer un registre par défaut
const register = new client.Registry();

// Activer la collecte des métriques système de base
client.collectDefaultMetrics({
  prefix: 'sparkfit_system_',
  timestamps: true,
  register,
});

// ===== Métriques des Workouts =====
const workoutMetrics = {
  // Nombre total de workouts créés par type (manuel/IA)
  creationCount: new client.Counter({
    name: 'sparkfit_workouts_created_total',
    help: 'Nombre total de workouts créés',
    labelNames: ['type', 'user_id'],
    registers: [register],
  }),

  // Distribution de la durée des workouts
  duration: new client.Histogram({
    name: 'sparkfit_workout_duration_minutes',
    help: 'Distribution de la durée des workouts en minutes',
    labelNames: ['type', 'user_id'],
    buckets: [15, 30, 45, 60, 90, 120],
    registers: [register],
  }),

  // Calories brûlées par workout
  caloriesBurned: new client.Histogram({
    name: 'sparkfit_workout_calories_burned',
    help: 'Distribution des calories brûlées par workout',
    labelNames: ['type', 'user_id'],
    buckets: [100, 200, 300, 500, 750, 1000],
    registers: [register],
  }),

  // Workouts mis à jour
  updateCount: new client.Counter({
    name: 'sparkfit_workouts_updated_total',
    help: 'Nombre total de workouts mis à jour',
    labelNames: ['user_id'],
    registers: [register],
  }),

  // Workouts supprimés
  deleteCount: new client.Counter({
    name: 'sparkfit_workouts_deleted_total',
    help: 'Nombre total de workouts supprimés',
    labelNames: ['user_id'],
    registers: [register],
  }),
};

// ===== Métriques des Exercices =====
const exerciseMetrics = {
  // Compteur par type d'exercice
  typeCount: new client.Counter({
    name: 'sparkfit_exercise_type_total',
    help: "Nombre total d'exercices par type",
    labelNames: ['exercise_type', 'body_part'],
    registers: [register],
  }),

  // Distribution des poids utilisés
  weightDistribution: new client.Histogram({
    name: 'sparkfit_exercise_weight_kg',
    help: 'Distribution des poids utilisés dans les exercices',
    labelNames: ['exercise_name', 'user_id'],
    buckets: [0, 5, 10, 20, 30, 50, 75, 100],
    registers: [register],
  }),

  // Taux de complétion des exercices
  completionRate: new client.Gauge({
    name: 'sparkfit_exercise_completion_rate',
    help: 'Taux de complétion des exercices (%)',
    labelNames: ['exercise_type', 'user_id'],
    registers: [register],
  }),

  // Exercices créés
  creationCount: new client.Counter({
    name: 'sparkfit_exercises_created_total',
    help: "Nombre total d'exercices créés",
    labelNames: ['exercise_name', 'goal_type'],
    registers: [register],
  }),
};

// ===== Métriques de Performance API =====
const apiMetrics = {
  // Latence des endpoints critiques
  latency: new client.Histogram({
    name: 'sparkfit_api_latency_seconds',
    help: 'Latence des endpoints API en secondes',
    labelNames: ['endpoint', 'method'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1],
    registers: [register],
  }),

  // Taux d'erreur par endpoint
  errorRate: new client.Counter({
    name: 'sparkfit_api_errors_total',
    help: "Nombre total d'erreurs par endpoint",
    labelNames: ['endpoint', 'error_type', 'status_code'],
    registers: [register],
  }),

  // Requêtes actives
  activeRequests: new client.Gauge({
    name: 'sparkfit_api_active_requests',
    help: 'Nombre de requêtes actives',
    labelNames: ['endpoint'],
    registers: [register],
  }),

  // Requêtes totales
  totalRequests: new client.Counter({
    name: 'sparkfit_api_requests_total',
    help: 'Nombre total de requêtes',
    labelNames: ['endpoint', 'method', 'status_code'],
    registers: [register],
  }),
};

// ===== Métriques Utilisateurs =====
const userMetrics = {
  // Utilisateurs actifs
  activeUsers: new client.Gauge({
    name: 'sparkfit_users_active',
    help: "Nombre d'utilisateurs actuellement actifs",
    registers: [register],
  }),

  // Progression des objectifs
  goalProgress: new client.Gauge({
    name: 'sparkfit_user_goal_progress',
    help: 'Progression vers les objectifs utilisateur (%)',
    labelNames: ['goal_type', 'user_id'],
    registers: [register],
  }),

  // Sessions utilisateur
  sessionDuration: new client.Histogram({
    name: 'sparkfit_user_session_duration_minutes',
    help: 'Durée des sessions utilisateur en minutes',
    labelNames: ['user_id'],
    buckets: [5, 15, 30, 60, 120],
    registers: [register],
  }),

  // Connexions utilisateur
  loginCount: new client.Counter({
    name: 'sparkfit_user_logins_total',
    help: 'Nombre total de connexions utilisateur',
    labelNames: ['user_id'],
    registers: [register],
  }),

  // Inscriptions utilisateur
  registrationCount: new client.Counter({
    name: 'sparkfit_user_registrations_total',
    help: "Nombre total d'inscriptions utilisateur",
    registers: [register],
  }),
};

// ===== Métriques de Base de Données =====
const dbMetrics = {
  // Latence des requêtes DB
  queryLatency: new client.Histogram({
    name: 'sparkfit_db_query_duration_seconds',
    help: "Temps d'exécution des requêtes DB en secondes",
    labelNames: ['query_type', 'table'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1],
    registers: [register],
  }),

  // Connexions actives
  activeConnections: new client.Gauge({
    name: 'sparkfit_db_connections_active',
    help: 'Nombre de connexions actives à la base de données',
    registers: [register],
  }),

  // Requêtes totales
  queryTotal: new client.Counter({
    name: 'sparkfit_db_queries_total',
    help: 'Nombre total de requêtes exécutées',
    labelNames: ['query_type', 'table'],
    registers: [register],
  }),

  // Erreurs de base de données
  queryErrors: new client.Counter({
    name: 'sparkfit_db_query_errors_total',
    help: "Nombre total d'erreurs de base de données",
    labelNames: ['query_type', 'table', 'error_code'],
    registers: [register],
  }),
};

module.exports = {
  register,
  workoutMetrics,
  exerciseMetrics,
  apiMetrics,
  userMetrics,
  dbMetrics,
};
