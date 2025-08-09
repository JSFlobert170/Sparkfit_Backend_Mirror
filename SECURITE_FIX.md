# Fix du problème de sécurité GitHub

## 🚨 Problème

GitHub Secret Scanning a détecté des clés API dans l'historique Git et bloque le push.

## ✅ Solutions appliquées

### 1. Suppression des secrets du code

- ✅ Remplacé les clés API dans `.gitlab-ci.yml` par des variables `$RENDER_SERVICE_ID` et `$RENDER_DEPLOY_KEY`
- ✅ Remplacé les clés API dans `docker-compose.yml` par des placeholders génériques
- ✅ Créé `ENV_VARIABLES.md` pour documenter les variables d'environnement

### 2. Nettoyer l'historique Git (nécessaire)

Pour supprimer les secrets de l'historique Git, tu dois exécuter ces commandes :

```bash
# 1. Faire un backup
git branch backup-avant-nettoyage

# 2. Utiliser git filter-branch pour nettoyer l'historique
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .gitlab-ci.yml docker-compose.yml' \
  --prune-empty --tag-name-filter cat -- --all

# 3. Forcer le push (attention: destructif)
git push origin --force --all
git push origin --force --tags

# 4. Nettoyer les références locales
git for-each-ref --format='delete %(refname)' refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now
```

### 3. Alternative plus douce (recommandée)

Si tu ne veux pas réécrire l'historique, tu peux :

1. **Aller sur GitHub** et cliquer sur le lien fourni dans l'erreur pour "autoriser" le secret
2. **Révoquer immédiatement** toutes les clés API exposées
3. **Générer de nouvelles clés** pour tous les services
4. **Configurer les nouvelles clés** dans les variables d'environnement

## 🔐 Nouvelles clés à générer

### OpenAI

- Révoquer : `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`
- Générer une nouvelle clé sur https://platform.openai.com/api-keys

### SendGrid

- Révoquer : `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`
- Générer une nouvelle clé sur https://app.sendgrid.com/settings/api_keys

### Twilio

- Révoquer le token : `c440e4de37d8026c15d61c8bbb6b538b`
- Générer un nouveau token sur https://console.twilio.com/

### Stripe

- Révoquer : `sk_test_51Rduoe2XomJTVpG16N9jFxiwEdgdV4Cj4QFeKmFLNtYsbDMIuFUJqoamYcwKiUibRWKU2hwcLpEd0NjAQzOR9iUx00YEQLE0Yh`
- Révoquer : `whsec_cdd6c76c30ffd31f494eac19ed4b2802324269ee57ffe4e3a60ba97c73b9692d`
- Générer de nouvelles clés sur https://dashboard.stripe.com/apikeys

### Render

- Révoquer : `u2qib-5adtk`
- Générer une nouvelle clé dans les paramètres du service Render

## 📝 Après avoir généré les nouvelles clés

1. **Configurer dans GitLab CI/CD** → Variables
2. **Configurer dans `.env` local** (ne pas committer)
3. **Tester** que tous les services fonctionnent
4. **Essayer le push** vers GitHub

## 🚀 Test de la solution

```bash
# Tester le push après les corrections
git add .
git commit -m "fix: remove hardcoded API keys, use environment variables"
git push origin develop
```

Si le push passe, le problème est résolu ! 🎉
