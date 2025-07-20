# Pipeline GitLab CI/CD - SparkFit Backend

## 📋 Vue d'ensemble

Ce pipeline GitLab CI/CD automatise les processus de test et de build pour le backend SparkFit. Il se déclenche uniquement sur les branches `develop` et `main`.

## 🚀 Déclenchement

Le pipeline se déclenche automatiquement sur :
- ✅ **Branche `develop`** - Tests et build
- ✅ **Branche `main`** - Tests et build
- ❌ **Merge Requests** - Pipeline désactivé
- ❌ **Autres branches** - Pipeline désactivé
- ❌ **Tags** - Pipeline désactivé

## 📊 Étapes du Pipeline

### 1. **Stage: Test**

#### Job: `test`
- **Objectif** : Exécuter tous les tests unitaires et d'intégration
- **Image** : `node:18-alpine`
- **Services** : PostgreSQL 14 pour les tests
- **Actions** :
  - Installation des dépendances
  - Configuration de Prisma
  - Exécution des tests avec couverture
  - Génération des rapports de couverture

#### Job: `lint` (optionnel)
- **Objectif** : Validation de la syntaxe et des imports
- **Actions** :
  - Vérification de la syntaxe JavaScript
  - Validation des imports
  - Validation du schéma Prisma

### 2. **Stage: Build**

#### Job: `build`
- **Objectif** : Construction de l'image Docker
- **Image** : `docker:20.10.16`
- **Services** : Docker-in-Docker
- **Actions** :
  - Construction de l'image Docker
  - Test de l'image
  - Nettoyage des images temporaires

## 🔧 Configuration

### Variables d'environnement
```yaml
NODE_VERSION: "18"
POSTGRES_VERSION: "14"
NODE_ENV: "test"
JWT_SECRET: "test-secret-key"
PORT: "3001"
DATABASE_URL: "postgresql://testuser:testpassword@postgres-test:5432/testdb"
```

### Cache
- **Clé** : Basée sur `package-lock.json`
- **Chemins** : `node_modules/`, `.npm/`

### Services
- **PostgreSQL** : Base de données de test
- **Docker-in-Docker** : Pour la construction d'images

## 📈 Rapports et Artifacts

### Couverture de code
- **Format** : Cobertura XML
- **Rapport HTML** : Disponible dans les artifacts
- **Seuil minimum** : 70% (branches, fonctions, lignes, statements)

### Artifacts
- **Rapports de couverture** : 1 semaine
- **Images Docker** : 1 semaine (succès uniquement)

## 🧪 Tests

### Structure des tests
```
tests/
├── setup.js          # Configuration globale
├── auth.test.js      # Tests d'authentification
└── workout.test.js   # Tests des workouts
```

### Commandes de test
```bash
# Tests simples
npm test

# Tests avec couverture
npm run test:coverage
```

## 🐳 Build Docker

### Image construite
- **Nom** : `sparkfit-backend`
- **Tags** : `latest`, `$CI_COMMIT_SHA`
- **Base** : `node:18-alpine`

### Vérifications
- ✅ Construction réussie
- ✅ Test de l'image
- ✅ Nettoyage automatique

## 🔍 Monitoring

### Métriques disponibles
- **Temps d'exécution** : Par job et stage
- **Couverture de code** : Pourcentage et tendances
- **Taux de succès** : Par branche et commit

### Notifications
- **Succès** : Pipeline vert
- **Échec** : Pipeline rouge avec détails
- **Warnings** : Couverture insuffisante

## 🛠️ Dépannage

### Problèmes courants

#### 1. Tests qui échouent
```bash
# Vérifier la base de données de test
docker run --rm postgres:14 psql -h postgres-test -U testuser -d testdb

# Relancer les tests localement
npm test
```

#### 2. Build Docker qui échoue
```bash
# Tester le build localement
docker build -t sparkfit-backend:test -f sparkfit_backend/Dockerfile .

# Vérifier les logs
docker logs <container-id>
```

#### 3. Couverture insuffisante
- Ajouter des tests pour les fonctions non couvertes
- Vérifier les patterns d'exclusion dans `jest.config.js`

### Logs et débogage
- **Logs GitLab** : Disponibles dans l'interface CI/CD
- **Artifacts** : Téléchargeables en cas d'échec
- **Variables** : Vérifiables dans les paramètres du projet

## 📝 Maintenance

### Mises à jour recommandées
- **Node.js** : Mettre à jour `NODE_VERSION` selon les LTS
- **PostgreSQL** : Mettre à jour `POSTGRES_VERSION` selon les releases
- **Docker** : Mettre à jour l'image Docker selon les versions

### Sécurité
- **Secrets** : Utiliser les variables GitLab protégées
- **Images** : Scanner les vulnérabilités régulièrement
- **Dépendances** : Mettre à jour `package.json` régulièrement

---

**Pipeline créé pour SparkFit Backend**  
**Version** : 1.0.0  
**Dernière mise à jour** : $(date) 