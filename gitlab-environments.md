# Configuration des Environnements GitLab - SparkFit Backend

## 🎯 Vue d'ensemble

Ce guide explique comment configurer les environnements GitLab pour le pipeline CI/CD du backend SparkFit.

## 🌍 Environnements Configurés

### 1. Staging Environment
- **Nom** : `staging`
- **URL** : `https://staging.sparkfit.com`
- **Déclenchement** : Manuel sur branche principale
- **Objectif** : Tests d'intégration et validation

### 2. Production Environment
- **Nom** : `production`
- **URL** : `https://api.sparkfit.com`
- **Déclenchement** : Manuel sur tags
- **Objectif** : Déploiement en production

## ⚙️ Configuration dans GitLab

### Étape 1 : Accéder aux Paramètres du Projet

1. Aller dans votre projet GitLab
2. Cliquer sur **Settings** (⚙️) dans la barre latérale
3. Sélectionner **CI/CD**
4. Faire défiler jusqu'à la section **Environments**

### Étape 2 : Créer l'Environnement Staging

1. Cliquer sur **New environment**
2. Remplir les informations :
   ```
   Name: staging
   External URL: https://staging.sparkfit.com
   ```
3. Cliquer sur **Save environment**

### Étape 3 : Créer l'Environnement Production

1. Cliquer sur **New environment**
2. Remplir les informations :
   ```
   Name: production
   External URL: https://api.sparkfit.com
   ```
3. Cliquer sur **Save environment**

## 🔐 Variables d'Environnement

### Variables pour Staging

Aller dans **Settings > CI/CD > Variables** et ajouter :

| Variable | Valeur | Protégée | Masquée |
|----------|--------|----------|---------|
| `STAGING_HOST` | `staging.sparkfit.com` | ✅ | ❌ |
| `STAGING_USER` | `deploy` | ✅ | ❌ |
| `STAGING_PATH` | `/opt/sparkfit/backend` | ✅ | ❌ |
| `STAGING_SSH_PRIVATE_KEY` | `-----BEGIN OPENSSH PRIVATE KEY-----...` | ✅ | ✅ |
| `STAGING_SSH_KNOWN_HOSTS` | `staging.sparkfit.com ssh-rsa...` | ✅ | ❌ |

### Variables pour Production

| Variable | Valeur | Protégée | Masquée |
|----------|--------|----------|---------|
| `PRODUCTION_HOST` | `api.sparkfit.com` | ✅ | ❌ |
| `PRODUCTION_USER` | `deploy` | ✅ | ❌ |
| `PRODUCTION_PATH` | `/opt/sparkfit/backend` | ✅ | ❌ |
| `PRODUCTION_SSH_PRIVATE_KEY` | `-----BEGIN OPENSSH PRIVATE KEY-----...` | ✅ | ✅ |
| `PRODUCTION_SSH_KNOWN_HOSTS` | `api.sparkfit.com ssh-rsa...` | ✅ | ❌ |

### Variables Globales

| Variable | Valeur | Protégée | Masquée |
|----------|--------|----------|---------|
| `DATABASE_URL` | `postgresql://myuser:mypassword@localhost:5432/test_database` | ❌ | ✅ |
| `JWT_SECRET` | `test-secret-key-change-in-production` | ❌ | ✅ |
| `PORT` | `3001` | ❌ | ❌ |
| `SLACK_WEBHOOK_URL` | `https://hooks.slack.com/services/...` | ❌ | ✅ |

## 🔑 Configuration des Clés SSH

### Génération des Clés SSH

```bash
# Générer une nouvelle paire de clés pour GitLab CI
ssh-keygen -t rsa -b 4096 -C "gitlab-ci@sparkfit.com" -f ~/.ssh/gitlab-ci

# Afficher la clé publique
cat ~/.ssh/gitlab-ci.pub

# Afficher la clé privée (à copier dans GitLab)
cat ~/.ssh/gitlab-ci
```

### Configuration sur les Serveurs

#### Serveur Staging
```bash
# Se connecter au serveur staging
ssh user@staging.sparkfit.com

# Ajouter la clé publique
echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC..." >> ~/.ssh/authorized_keys

# Créer l'utilisateur deploy
sudo useradd -m -s /bin/bash deploy
sudo mkdir -p /opt/sparkfit/backend
sudo chown deploy:deploy /opt/sparkfit/backend

# Ajouter la clé pour l'utilisateur deploy
sudo mkdir -p /home/deploy/.ssh
sudo cp ~/.ssh/authorized_keys /home/deploy/.ssh/
sudo chown -R deploy:deploy /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys
```

#### Serveur Production
```bash
# Se connecter au serveur production
ssh user@api.sparkfit.com

# Répéter les mêmes étapes que pour staging
# (avec les clés appropriées pour production)
```

### Obtenir les Known Hosts

```bash
# Pour staging
ssh-keyscan -H staging.sparkfit.com

# Pour production
ssh-keyscan -H api.sparkfit.com
```

## 🐳 Configuration du Container Registry

### Activation du Registry

1. Aller dans **Settings > General**
2. Faire défiler jusqu'à **Visibility, project features, permissions**
3. Activer **Container Registry**
4. Cliquer sur **Save changes**

### Variables Automatiques

Une fois activé, GitLab définit automatiquement :
- `CI_REGISTRY` = `registry.gitlab.com`
- `CI_REGISTRY_USER` = `gitlab-ci-token`
- `CI_REGISTRY_PASSWORD` = `$CI_JOB_TOKEN`
- `CI_REGISTRY_IMAGE` = `registry.gitlab.com/username/project`

## 🔄 Workflow de Déploiement

### Déploiement Staging

1. **Push sur la branche principale** :
   ```bash
   git push origin main
   ```

2. **Pipeline automatique** :
   - Tests unitaires
   - Build Docker
   - Job `deploy:staging` disponible manuellement

3. **Déclenchement manuel** :
   - Aller dans **CI/CD > Pipelines**
   - Cliquer sur le pipeline récent
   - Cliquer sur **deploy:staging**
   - Cliquer sur **Play**

### Déploiement Production

1. **Créer un tag** :
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Pipeline automatique** :
   - Tests unitaires
   - Build Docker
   - Job `deploy:production` disponible manuellement

3. **Déclenchement manuel** :
   - Aller dans **CI/CD > Pipelines**
   - Cliquer sur le pipeline du tag
   - Cliquer sur **deploy:production**
   - Cliquer sur **Play**

## 📊 Monitoring des Environnements

### Tableau de Bord

1. Aller dans **Operations > Environments**
2. Voir l'état des environnements
3. Accéder aux URLs de déploiement
4. Consulter l'historique des déploiements

### Métriques

- **Temps de déploiement**
- **Taux de succès**
- **Nombre de déploiements**
- **Dernier déploiement**

## 🛡️ Sécurité

### Bonnes Pratiques

1. **Clés SSH protégées** :
   - Marquer comme "Protected"
   - Marquer comme "Masked"
   - Utiliser des clés différentes par environnement

2. **Variables sensibles** :
   - Masquer les mots de passe
   - Protéger les variables de production
   - Rotation régulière des secrets

3. **Permissions** :
   - Limiter l'accès aux environnements
   - Utiliser des utilisateurs dédiés sur les serveurs
   - Auditer régulièrement les accès

### Audit

1. **Logs de déploiement** :
   - Consulter les logs dans GitLab
   - Surveiller les tentatives d'accès
   - Vérifier les changements de configuration

2. **Notifications** :
   - Configurer les alertes Slack
   - Surveiller les échecs de déploiement
   - Notifier les équipes concernées

## 🔍 Dépannage

### Problèmes Courants

#### Erreur de Connexion SSH
```bash
# Vérifier la clé SSH
ssh -i ~/.ssh/gitlab-ci deploy@staging.sparkfit.com

# Vérifier les permissions
ls -la ~/.ssh/
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub
```

#### Erreur de Registry
```bash
# Vérifier l'accès au registry
docker login registry.gitlab.com

# Vérifier les permissions du projet
# Settings > General > Visibility, project features, permissions
```

#### Erreur de Variables
```bash
# Vérifier les variables dans GitLab
# Settings > CI/CD > Variables

# Tester les variables dans un job
echo "Testing variable: $VARIABLE_NAME"
```

### Support

Pour toute question :
1. Consulter la documentation GitLab CI/CD
2. Vérifier les logs du pipeline
3. Contacter l'équipe DevOps
4. Consulter les forums GitLab

---

**Dernière mise à jour** : $(date)
**Version** : 1.0.0 