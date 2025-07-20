# �� Guide GitLab CI/CD - SparkFit Backend

## 📋 Qu'est-ce que GitLab CI/CD ?

GitLab CI/CD est un système qui automatise les tests et le déploiement de votre code. C'est comme un assistant qui :
- ✅ Teste votre code automatiquement
- 🏗️ Construit votre application
- 🚀 La déploie en ligne

## 🔧 Configuration actuelle

### 📁 Fichier : `.gitlab-ci.yml`

```yaml
stages:
  - test    # Étape 1 : Tests
  - build   # Étape 2 : Construction Docker
```

### 🎯 Étape 1 : Tests (`test`)

**Objectif :** Vérifier que votre code fonctionne

**Ce qui se passe :**
1. 🐳 Lance un conteneur Node.js 18
2. 🗄️ Démarre une base de données PostgreSQL
3. 📦 Installe les dépendances backend
4. 📦 Installe les dépendances Prisma
5. 🔧 Génère le client Prisma
6. 🗄️ Applique les migrations
7. 🧪 Lance les tests
8. 💾 Sauvegarde les rapports de couverture

### 🏗️ Étape 2 : Construction (`build`)

**Objectif :** Créer une image Docker de votre application

**Ce qui se passe :**
1. 🐳 Utilise Docker pour construire Docker
2. 🏗️ Construit l'image avec le code actuel
3. 🏷️ Tag l'image avec le numéro de commit
4. 🧪 Teste que l'image fonctionne
5. 💾 Sauvegarde les informations d'image

## 🚀 Comment utiliser

### 1. **Pousser du code :**
```bash
git add .
git commit -m "Ajout nouvelle fonctionnalité"
git push origin develop
```

### 2. **Voir les résultats :**
- Allez sur GitLab
- Cliquez sur "CI/CD" → "Pipelines"
- Cliquez sur votre pipeline pour voir les détails

### 3. **Comprendre les statuts :**
- 🟢 **Succès** : Tout fonctionne
- 🔴 **Échec** : Il y a un problème à corriger
- 🟡 **En cours** : Le pipeline s'exécute

## 🔍 Variables d'environnement

### Pour les tests :
- `DATABASE_URL` : Connexion à la base de test
- `NODE_ENV` : Environnement de test
- `JWT_SECRET` : Clé secrète pour les tests

### Pour Docker :
- `DOCKER_TLS_CERTDIR` : Certificats Docker
- `DOCKER_HOST` : Connexion au daemon Docker

## 📊 Cache

Le pipeline utilise un cache pour :
- `node_modules/` : Dépendances Node.js
- `../sparkfit_prisma-schema/node_modules/` : Dépendances Prisma

Cela accélère les builds suivants.

## 🛠️ Dépannage

### Problème : Tests qui échouent
**Solution :**
1. Vérifiez les logs dans GitLab
2. Testez localement : `npm test`
3. Vérifiez la base de données

### Problème : Build Docker qui échoue
**Solution :**
1. Vérifiez le Dockerfile
2. Testez localement : `docker build .`
3. Vérifiez les dépendances

### Problème : Pipeline ne se lance pas
**Solution :**
1. Vérifiez que le fichier `.gitlab-ci.yml` est dans le bon répertoire
2. Vérifiez la syntaxe YAML
3. Vérifiez les permissions GitLab

## 📈 Prochaines étapes

Une fois que cette configuration fonctionne, vous pourrez ajouter :

1. **Déploiement automatique** en staging
2. **Déploiement manuel** en production
3. **Tests de sécurité**
4. **Analyse de code**
5. **Notifications Slack/Email**

## 🎓 Apprentissage

Cette configuration vous apprend :
- ✅ **YAML** : Format de configuration
- ✅ **Docker** : Conteneurisation
- ✅ **CI/CD** : Intégration continue
- ✅ **Tests automatisés** : Qualité du code
- ✅ **Base de données** : Tests avec PostgreSQL

---

**💡 Conseil :** Commencez simple, puis ajoutez des fonctionnalités progressivement ! 