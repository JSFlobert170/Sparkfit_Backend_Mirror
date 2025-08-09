# Variables d'environnement SparkFit

## Variables requises pour le développement local

Créez un fichier `.env` dans le répertoire racine avec ces variables :

```bash
# ===========================================
# SPARKFIT BACKEND - VARIABLES D'ENVIRONNEMENT
# ===========================================

# Base de données
DATABASE_URL=postgresql://myuser:mypassword@localhost:5432/mydatabase

# JWT Secret pour l'authentification
JWT_SECRET=your-super-secret-jwt-key-here

# OpenAI API (Service IA)
OPENAI_API_KEY=sk-proj-your-openai-api-key-here

# SendGrid API (Service de notification - Email)
SENDGRID_API_KEY=SG.your-sendgrid-api-key-here
SENDGRID_FROM_EMAIL=your-email@example.com

# Twilio API (Service de notification - SMS)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-twilio-auth-token-here
TWILIO_PHONE_NUMBER=+1234567890

# Stripe API (Service de paiement)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key-here
STRIPE_WEBHOOK_SECRET=whsec_your-stripe-webhook-secret-here
```

## Variables CI/CD GitLab

Dans les paramètres du projet GitLab → CI/CD → Variables :

```bash
# Render Deploy
RENDER_SERVICE_ID=srv-your-render-service-id
RENDER_DEPLOY_KEY=your-render-deploy-key

# GitHub Mirror
GITHUB_USER=your-github-username
GITHUB_TOKEN=ghp_your-github-personal-access-token

# GitLab Release
GITLAB_TOKEN=glpat-your-gitlab-token
```

## Comment obtenir les clés API

### OpenAI

1. Allez sur https://platform.openai.com/api-keys
2. Créez une nouvelle clé API
3. Copiez la clé qui commence par `sk-proj-`

### SendGrid

1. Allez sur https://app.sendgrid.com/settings/api_keys
2. Créez une nouvelle clé API avec permissions "Mail Send"
3. Copiez la clé qui commence par `SG.`

### Twilio

1. Allez sur https://console.twilio.com/
2. Copiez votre Account SID et Auth Token
3. Achetez un numéro de téléphone Twilio

### Stripe

1. Allez sur https://dashboard.stripe.com/apikeys
2. Copiez votre clé secrète de test qui commence par `sk_test_`
3. Configurez un webhook endpoint pour obtenir la clé webhook

### GitHub Token

1. Allez sur GitHub → Settings → Developer settings → Personal access tokens
2. Générez un token avec permission `repo`
3. Copiez le token qui commence par `ghp_`

### GitLab Token

1. Allez sur GitLab → User Settings → Access Tokens
2. Créez un token avec permissions `api`, `read_repository`, `write_repository`
3. Copiez le token qui commence par `glpat-`
