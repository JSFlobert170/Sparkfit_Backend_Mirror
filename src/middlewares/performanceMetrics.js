const { performanceMetrics } = require('../metrics/performanceMetrics');

const performanceMetricsMiddleware = (req, res, next) => {
    // Incrémenter le compteur de requêtes actives
    performanceMetrics.apiActiveRequests.inc({ endpoint: req.path });

    // Début du chronomètre pour la latence
    const start = process.hrtime();

    // Intercepter la fin de la requête
    res.on('finish', () => {
        // Décrémenter le compteur de requêtes actives
        performanceMetrics.apiActiveRequests.dec({ endpoint: req.path });

        // Calculer la durée
        const duration = process.hrtime(start);
        const durationSeconds = duration[0] + duration[1] / 1e9;

        // Enregistrer la latence
        performanceMetrics.apiLatency.observe({ 
            endpoint: req.path, 
            method: req.method 
        }, durationSeconds);

        // Enregistrer les erreurs si le statut est >= 400
        if (res.statusCode >= 400) {
            performanceMetrics.apiErrors.inc({ 
                endpoint: req.path,
                method: req.method,
                status: res.statusCode
            });
            }
    });

    next();
};

module.exports = performanceMetricsMiddleware; 