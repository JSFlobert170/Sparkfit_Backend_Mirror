const rateLimit = require('express-rate-limit');
const { serverErrorsTotal, rateLimitHits } = require('../metrics');

// Rate limiter configuration
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limite chaque IP à 100 requêtes par fenêtre
    message: "Trop de requêtes depuis cette IP, veuillez réessayer plus tard",
    onLimitReached: (req, res, options) => {
        rateLimitHits.labels(req.path).inc();
    }
});

// Middleware de gestion des erreurs
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    
    // Incrémenter le compteur d'erreurs 5xx
    if (statusCode >= 500) {
        serverErrorsTotal.labels(req.path).inc();
    }

    res.status(statusCode).json({
        status: statusCode,
        message: err.message || "Une erreur est survenue",
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = {
    limiter,
    errorHandler
}; 