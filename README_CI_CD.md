# 🚀 GitLab CI/CD - Guide Complet

## 📋 Qu'est-ce que GitLab CI/CD ?

**CI/CD** signifie **Continuous Integration / Continuous Deployment** (Intégration Continue / Déploiement Continu).

### 🔄 Intégration Continue (CI)
- **Automatise les tests** à chaque push de code
- **Détecte les bugs** rapidement
- **Assure la qualité** du code

### 🚀 Déploiement Continu (CD)
- **Déploie automatiquement** le code en production
- **Réduit les erreurs** humaines
- **Accélère les livraisons**

## 🏗️ Structure de notre Pipeline

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    TEST     │───▶│    BUILD    │───▶│   DEPLOY    │
│             │    │             │    │             │
│ • Tests     │    │ • Docker    │    │ • Staging   │
│ • Migrations│    │ • Images    │    │ • Production│
└─────────────┘    └─────────────┘    └─────────────┘
```

## 📁 Fichier `.gitlab-ci.yml`

Ce fichier définit **TOUT** le processus automatisé :

### 1️⃣ **Stages** (Étapes)
```yaml
stages:
  - test      # 1. Tests unitaires
  - build     # 2. Construction Docker
  - deploy    # 3. Déploiement
```

### 2️⃣ **Jobs** (Tâches)
Chaque stage contient des jobs qui s'exécutent en parallèle :

#### 🧪 **Job `test`**
```yaml
test:
  stage: test
  script:
    - npm ci          # Installer les dépendances
    - npm test        # Exécuter les tests
```

#### 🔨 **Job `build`**
```yaml
build:
  stage: build
  script:
    - docker build -t sparkfit-backend:$CI_COMMIT_SHORT_SHA .
```

#### 🚀 **Job `deploy`**
```yaml
deploy_production:
  stage: deploy
  script:
    - echo "Déploiement en production"
  when: manual  # Déclenchement manuel
```

## 🎯 Comment ça fonctionne ?

### 1. **Déclenchement**
```bash
git push origin develop
```
⬇️
GitLab détecte le push et lance automatiquement la pipeline

### 2. **Exécution séquentielle**
```
test → build → deploy
```
- Si `test` échoue → Pipeline s'arrête
- Si `test` réussit → `build` commence
- Si `build` réussit → `deploy` commence

### 3. **Environnements**
- **`develop`** → Tests + Build + Staging
- **`main`** → Tests + Build + Production (manuel)

## 🔧 Variables d'environnement

### Variables GitLab (automatiques)
```yaml
$CI_COMMIT_SHORT_SHA    # Hash du commit (ex: a1b2c3d)
$CI_PROJECT_DIR         # Chemin du projet
$CI_COMMIT_REF_SLUG     # Nom de la branche
```

### Variables personnalisées
```yaml
variables:
  DOCKER_IMAGE: node:18-alpine
  IMAGE_NAME: sparkfit-backend
  DATABASE_URL: "postgresql://..."
```

## 🐳 Docker dans GitLab CI

### Docker-in-Docker (DinD)
```yaml
services:
  - docker:20.10.16-dind  # Docker daemon

variables:
  DOCKER_TLS_CERTDIR: "/certs"
  DOCKER_HOST: tcp://docker:2376
```

### Construction d'images
```yaml
script:
  - docker build -t $IMAGE_NAME:$IMAGE_TAG .
  - docker push $IMAGE_NAME:$IMAGE_TAG
```

## 📊 Artifacts et Cache

### Artifacts (Fichiers conservés)
```yaml
artifacts:
  paths:
    - coverage/          # Rapports de couverture
    - test-results/      # Résultats de tests
  expire_in: 1 week      # Conservation 1 semaine
```

### Cache (Accélération)
```yaml
cache:
  key: "$CI_COMMIT_REF_SLUG"
  paths:
    - node_modules/      # Dépendances Node.js
    - .npm/             # Cache npm
```

## 🎮 Utilisation pratique

### 1. **Développement quotidien**
```bash
# 1. Créer une branche feature
git checkout -b feature/nouvelle-fonctionnalite

# 2. Développer et tester localement
npm test
npm run build

# 3. Pousser sur develop
git checkout develop
git merge feature/nouvelle-fonctionnalite
git push origin develop
# → Pipeline automatique : test → build → staging
```

### 2. **Livraison en production**
```bash
# 1. Merger develop vers main
git checkout main
git merge develop
git push origin main
# → Pipeline automatique : test → build → production (manuel)

# 2. Valider le déploiement
# Aller sur GitLab > CI/CD > Pipelines > Cliquer sur "Deploy"
```

## 📈 Monitoring et Debug

### 1. **Voir les pipelines**
- GitLab > Votre projet > **CI/CD > Pipelines**

### 2. **Voir les logs**
- Cliquer sur un pipeline
- Cliquer sur un job
- Voir les logs en temps réel

### 3. **Variables de debug**
```yaml
script:
  - echo "Commit: $CI_COMMIT_SHORT_SHA"
  - echo "Branche: $CI_COMMIT_REF_SLUG"
  - echo "Répertoire: $CI_PROJECT_DIR"
```

## 🚨 Gestion des erreurs

### 1. **Tests qui échouent**
```yaml
test:
  script:
    - npm test
  # Si npm test retourne une erreur → Job échoue → Pipeline s'arrête
```

### 2. **Déploiement manuel**
```yaml
deploy_production:
  when: manual  # Nécessite une validation humaine
```

### 3. **Rollback automatique**
```yaml
deploy_production:
  script:
    - kubectl set image deployment/sparkfit-backend sparkfit-backend=$IMAGE_NAME:$IMAGE_TAG
    - kubectl rollout status deployment/sparkfit-backend --timeout=300s
    - kubectl rollout undo deployment/sparkfit-backend  # Si échec
```

## 🔐 Sécurité

### 1. **Variables sensibles**
```yaml
# Dans GitLab > Settings > CI/CD > Variables
DATABASE_PASSWORD: "***"  # Masqué dans les logs
JWT_SECRET: "***"
```

### 2. **Permissions**
```yaml
deploy_production:
  only:
    - main              # Seulement sur main
  when: manual          # Validation manuelle
```

## 📚 Ressources utiles

- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)
- [YAML Syntax](https://yaml.org/spec/)
- [Docker Documentation](https://docs.docker.com/)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/)

## 🎯 Prochaines étapes

1. **Configurer les variables d'environnement** dans GitLab
2. **Tester la pipeline** avec un petit changement
3. **Configurer les notifications** (Slack, email)
4. **Optimiser les performances** (cache, parallélisation)
5. **Ajouter des tests de sécurité** (SAST, DAST)

---

**💡 Conseil** : Commencez simple, puis ajoutez progressivement des fonctionnalités ! 