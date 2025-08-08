# Monitoring SparkFit Backend

## Vue d'ensemble

Le backend SparkFit utilise **Prometheus** et **Grafana** pour le monitoring en temps réel des métriques de performance et d'utilisation.

## Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Backend   │───▶│ Prometheus  │───▶│   Grafana   │
│   (Port 3000)│    │  (Port 9090) │    │  (Port 3001) │
└─────────────┘    └─────────────┘    └─────────────┘
```

## Métriques collectées

### 1. Métriques système (automatiques)

- **CPU** : utilisation du processeur
- **Mémoire** : utilisation de la RAM
- **Disque** : espace utilisé
- **Réseau** : trafic entrant/sortant

### 2. Métriques API

- **Latence** : temps de réponse des endpoints
- **Requêtes totales** : nombre de requêtes par endpoint
- **Erreurs** : taux d'erreur par endpoint
- **Requêtes actives** : requêtes en cours

### 3. Métriques métier

- **Workouts** : créations, mises à jour, suppressions
- **Exercices** : types d'exercices utilisés
- **Utilisateurs** : connexions, inscriptions, sessions actives
- **Base de données** : requêtes, latence, erreurs

## Configuration

### Prometheus

- **Fichier** : `sparkfit_backend/prometheus.yml`
- **Port** : 9090
- **Scraping** : toutes les 5 secondes pour le backend
- **Rétention** : 200 heures, 512MB max

### Grafana

- **Port** : 3001
- **Admin** : admin/admin
- **Dashboards** : provisionnés automatiquement
- **Datasource** : Prometheus configuré automatiquement

## Accès

### Prometheus

```
http://localhost:9090
```

### Grafana

```
http://localhost:3001
Login: admin
Password: admin
```

## Métriques disponibles

### Endpoint des métriques

```
http://localhost:3000/api/metrics
```

### Exemples de métriques

#### Workouts

```
# Workouts créés
sparkfit_workouts_created_total{type="manual",user_id="1"}

# Durée des workouts
sparkfit_workout_duration_minutes{type="manual",user_id="1"}

# Calories brûlées
sparkfit_workout_calories_burned{type="manual",user_id="1"}
```

#### API

```
# Latence des endpoints
sparkfit_api_latency_seconds{endpoint="/api/workouts",method="POST"}

# Requêtes totales
sparkfit_api_requests_total{endpoint="/api/workouts",method="POST",status_code="200"}

# Erreurs
sparkfit_api_errors_total{endpoint="/api/workouts",error_type="server_error"}
```

#### Utilisateurs

```
# Utilisateurs actifs
sparkfit_users_active

# Connexions
sparkfit_user_logins_total{user_id="1"}

# Inscriptions
sparkfit_user_registrations_total
```

## Dashboards Grafana

### Dashboard principal : "SparkFit Metrics"

- **Vue d'ensemble** : métriques système et API
- **Workouts** : statistiques des entraînements
- **Utilisateurs** : activité des utilisateurs
- **Performance** : latence et erreurs

### Panels inclus

1. **Métriques système**
   - CPU, mémoire, disque
   - Temps de réponse moyen

2. **API Performance**
   - Latence par endpoint
   - Taux d'erreur
   - Requêtes par minute

3. **Métriques métier**
   - Workouts créés/mis à jour/supprimés
   - Utilisateurs actifs
   - Exercices populaires

## Démarrage

```bash
# Démarrer tous les services
docker-compose up -d

# Vérifier les services
docker-compose ps

# Logs du backend
docker-compose logs -f backend

# Logs de Prometheus
docker-compose logs -f prometheus

# Logs de Grafana
docker-compose logs -f grafana
```

## Troubleshooting

### Prometheus ne collecte pas les métriques

1. Vérifier que le backend est accessible : `curl http://localhost:3000/api/metrics`
2. Vérifier la configuration dans `prometheus.yml`
3. Consulter les logs : `docker-compose logs prometheus`

### Grafana ne se connecte pas à Prometheus

1. Vérifier que Prometheus fonctionne : `http://localhost:9090`
2. Vérifier la configuration du datasource dans Grafana
3. Consulter les logs : `docker-compose logs grafana`

### Métriques manquantes

1. Vérifier que les métriques sont bien appelées dans le code
2. Vérifier que l'endpoint `/api/metrics` retourne des données
3. Consulter les logs du backend

## Développement

### Ajouter de nouvelles métriques

1. **Définir la métrique** dans `src/metrics.js` :

```javascript
const newMetric = new client.Counter({
  name: 'sparkfit_new_metric_total',
  help: 'Description de la métrique',
  labelNames: ['label1', 'label2'],
  registers: [register],
});
```

2. **Utiliser la métrique** dans le contrôleur :

```javascript
const { newMetric } = require('../metrics');

// Dans la fonction
newMetric.inc({ label1: 'value1', label2: 'value2' });
```

3. **Tester** : vérifier que la métrique apparaît dans `/api/metrics`

### Ajouter un nouveau dashboard

1. Créer le fichier JSON du dashboard
2. L'ajouter dans `grafana/provisioning/dashboards/`
3. Redémarrer Grafana : `docker-compose restart grafana`
