const { apiMetrics } = require('../metrics');

const performanceMetricsMiddleware = (req, res, next) => {
  // Incrémenter le compteur de requêtes actives
  apiMetrics.activeRequests.inc({ endpoint: req.path });

  // Début du chronomètre pour la latence
  const start = process.hrtime();

  // Intercepter la fin de la requête
  res.on('finish', () => {
    // Décrémenter le compteur de requêtes actives
    apiMetrics.activeRequests.dec({ endpoint: req.path });

    // Calculer la durée
    const duration = process.hrtime(start);
    const durationSeconds = duration[0] + duration[1] / 1e9;

    // Enregistrer la latence
    apiMetrics.latency.observe(
      {
        endpoint: req.path,
        method: req.method,
      },
      durationSeconds
    );

    // Enregistrer les requêtes totales
    apiMetrics.totalRequests.inc({
      endpoint: req.path,
      method: req.method,
      status_code: res.statusCode,
    });

    // Enregistrer les erreurs si le statut est >= 400
    if (res.statusCode >= 400) {
      apiMetrics.errorRate.inc({
        endpoint: req.path,
        error_type: res.statusCode >= 500 ? 'server_error' : 'client_error',
        status_code: res.statusCode,
      });
    }
  });

  next();
};

module.exports = performanceMetricsMiddleware;
