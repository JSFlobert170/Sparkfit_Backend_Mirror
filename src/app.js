const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./utils/swagger');
const dotenv = require('dotenv');
const performanceMetricsMiddleware = require('./middlewares/performanceMetrics');
const { errorHandler } = require('./middlewares/errorHandler');
const logger = require('./utils/logger');
const { limiter } = require('./middlewares/errorHandler');
// const healthRoutes = require('./routes/health.js');
require('./postgresConnection');

// Importer les registres de métriques
const { register } = require('./metrics');

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(cors());

// Middleware de métriques
app.use(performanceMetricsMiddleware);

app.use(limiter);

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Route de santé
// app.use('/health', healthRoutes);

// Route pour les métriques
app.get('/api/metrics', async (req, res) => {
  try {
    const metrics = await register.metrics();
    res.set('Content-Type', register.contentType);
    res.end(metrics);
  } catch (err) {
    logger.error('Erreur lors de la récupération des métriques:', err);
    res.status(500).end(err);
  }
});

// initial route
app.get('/', (req, res) => {
  res.send({ message: 'Welcome to the application.' });
});

// api routes prefix
app.use('/api', routes);

// Middleware de gestion des erreurs
app.use(errorHandler);

// Exporter l'app pour les tests
module.exports = app;

// Démarrer le serveur seulement si ce n'est pas un import pour les tests
if (require.main === module) {
  app.listen(process.env.PORT || 3000, 0.0.0.0 () => {
    logger.info(
      `Server is running on http://localhost:${process.env.PORT || 3000}`
    );
    logger.info(
      `Metrics available at http://localhost:${process.env.PORT || 3000}/api/metrics`
    );
  });
}
