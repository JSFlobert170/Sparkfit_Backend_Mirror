# Pipeline GitLab CI/CD - SparkFit Backend

## 📋 Vue d'ensemble

Ce pipeline GitLab CI/CD automatise le processus de test, build et déploiement du backend SparkFit. Il prend en compte la structure particulière du projet où le schéma Prisma se trouve dans un répertoire séparé à la racine.

## 🏗️ Architecture du Pipeline

### Étapes (Stages)
1. **test** - Tests unitaires, validation Prisma, audit de sécurité
2. **build** - Construction de l'image Docker
3. **deploy** - Déploiement en staging et production

### Jobs Principaux
- `test` - Tests unitaires avec couverture
- `prisma:validate` - Validation du schéma Prisma
- `security:audit` - Audit de sécurité npm
- `build` - Build et push des images Docker
- `deploy:staging` - Déploiement en environnement de staging
- `deploy:production` - Déploiement en production
- `notify:slack` - Notifications Slack (optionnel)

## ⚙️ Configuration Requise

### Variables d'Environnement GitLab

#### Variables de Base
```bash
# Base de données de test
DATABASE_URL=postgresql://myuser:mypassword@localhost:5432/test_database

# JWT pour les tests
JWT_SECRET=test-secret-key

# Port pour les tests
PORT=3001
```

#### Variables de Déploiement Staging
```bash
STAGING_HOST=staging-server.com
STAGING_USER=deploy
STAGING_PATH=/opt/sparkfit/backend
STAGING_SSH_PRIVATE_KEY=<clé_ssh_privée>
STAGING_SSH_KNOWN_HOSTS=<known_hosts>
```

#### Variables de Déploiement Production
```bash
PRODUCTION_HOST=production-server.com
PRODUCTION_USER=deploy
PRODUCTION_PATH=/opt/sparkfit/backend
PRODUCTION_SSH_PRIVATE_KEY=<clé_ssh_privée>
PRODUCTION_SSH_KNOWN_HOSTS=<known_hosts>
```

#### Variables Optionnelles
```bash
# Notifications Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# Registry Docker (si différent de GitLab)
CI_REGISTRY=registry.gitlab.com
CI_REGISTRY_USER=gitlab-ci-token
CI_REGISTRY_PASSWORD=$CI_JOB_TOKEN
```

### Configuration du Registry GitLab

1. Aller dans **Settings > General > Visibility, project features, permissions**
2. Activer **Container Registry**
3. Les variables `CI_REGISTRY_*` sont automatiquement définies

## 🚀 Utilisation

### Déclenchement Automatique

Le pipeline se déclenche automatiquement sur :
- **Merge Requests** - Tests et validation
- **Branche principale** - Tests, build, déploiement staging (manuel)
- **Tags** - Tests, build, déploiement production (manuel)
- **Branches feature/hotfix** - Tests uniquement

### Déploiement Manuel

#### Staging
```bash
# Le déploiement staging est manuel sur la branche principale
git push origin main
# Puis déclencher manuellement le job deploy:staging
```

#### Production
```bash
# Créer un tag pour déclencher le déploiement production
git tag v1.0.0
git push origin v1.0.0
# Puis déclencher manuellement le job deploy:production
```

## 📁 Structure des Fichiers

```
sparkfit_backend/
├── .gitlab-ci.yml          # Pipeline principal
├── CI_CD_README.md         # Cette documentation
├── Dockerfile              # Image Docker
├── entrypoint.sh           # Script d'entrée Docker
├── package.json            # Dépendances Node.js
├── src/                    # Code source
├── tests/                  # Tests unitaires
└── prisma/                 # Schéma Prisma (copié depuis la racine)
```

## 🔧 Configuration Spécifique

### Gestion du Schéma Prisma

Le pipeline copie automatiquement le schéma Prisma depuis le répertoire racine :
```yaml
PRISMA_SCHEMA_PATH: "../sparkfit_prisma-schema"
```

### Base de Données de Test

Le pipeline utilise PostgreSQL comme service :
```yaml
services:
  - postgres:13
```

### Cache et Optimisation

Le pipeline utilise le cache pour optimiser les builds :
```yaml
cache:
  key: 
    files:
      - package-lock.json
  paths:
    - node_modules/
    - .npm/
```

## 🛡️ Sécurité

### Audit de Sécurité
- Vérification automatique des vulnérabilités npm
- Niveau d'alerte configuré sur "moderate"
- Rapport de vulnérabilités dans les artifacts

### Variables Sensibles
- Toutes les clés SSH sont stockées comme variables protégées
- Les mots de passe de base de données sont chiffrés
- Les tokens JWT sont différents entre test et production

## 📊 Monitoring et Rapports

### Couverture de Code
- Rapport de couverture généré automatiquement
- Format Cobertura pour intégration avec GitLab
- Artifacts conservés pendant 1 semaine

### Notifications
- Notifications Slack pour les succès/échecs
- Intégration avec les environnements GitLab
- URLs de déploiement automatiquement générées

## 🔍 Dépannage

### Problèmes Courants

#### Erreur de Connexion à la Base de Données
```bash
# Vérifier que PostgreSQL est prêt
until pg_isready -h postgres -p 5432 -U myuser; do
  echo "En attente de PostgreSQL..."
  sleep 2
done
```

#### Erreur de Schéma Prisma
```bash
# Vérifier que le schéma est copié correctement
ls -la prisma/
npx prisma validate --schema=./prisma/schema.prisma
```

#### Erreur de Build Docker
```bash
# Vérifier les permissions du registry
docker login -u $CI_REGISTRY_USER --password-stdin $CI_REGISTRY
```

### Logs et Debugging

1. **Logs du Pipeline** - Disponibles dans l'interface GitLab
2. **Artifacts** - Rapports de couverture et logs de build
3. **Variables d'Environnement** - Vérifiables dans Settings > CI/CD

## 📈 Métriques et KPIs

### Métriques Automatiques
- **Temps d'exécution** du pipeline
- **Taux de succès** des déploiements
- **Couverture de code** par commit
- **Vulnérabilités** détectées

### Tableau de Bord Recommandé
- Temps moyen de build : < 10 minutes
- Couverture de code : > 80%
- Vulnérabilités critiques : 0
- Taux de succès déploiement : > 95%

## 🔄 Maintenance

### Mises à Jour Régulières
- **Node.js** - Mise à jour de la version dans `NODE_VERSION`
- **PostgreSQL** - Mise à jour de la version du service
- **Docker** - Mise à jour de l'image Docker-in-Docker
- **Dépendances** - Audit de sécurité mensuel

### Sauvegarde
- **Variables d'environnement** - Export régulier
- **Configurations** - Versioning dans Git
- **Artifacts** - Archivage des rapports importants

## 📞 Support

Pour toute question ou problème :
1. Vérifier la documentation GitLab CI/CD
2. Consulter les logs du pipeline
3. Vérifier la configuration des variables d'environnement
4. Contacter l'équipe DevOps

---

**Dernière mise à jour** : $(date)
**Version** : 1.0.0 