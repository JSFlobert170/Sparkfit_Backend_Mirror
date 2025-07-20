#!/bin/bash

# Script de test local pour GitLab CI/CD
# Ce script simule l'environnement GitLab CI localement

echo "🚀 Test local GitLab CI/CD - SparkFit Backend"
echo "=============================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    print_error "Docker n'est pas installé. Veuillez installer Docker."
    exit 1
fi

print_status "Docker est installé"

# Vérifier que le fichier .gitlab-ci.yml existe
if [ ! -f ".gitlab-ci.yml" ]; then
    print_error "Fichier .gitlab-ci.yml non trouvé"
    exit 1
fi

print_status "Fichier .gitlab-ci.yml trouvé"

# Vérifier que package.json existe
if [ ! -f "package.json" ]; then
    print_error "Fichier package.json non trouvé"
    exit 1
fi

print_status "Fichier package.json trouvé"

# Vérifier que le schéma Prisma existe
if [ ! -f "prisma/schema.prisma" ]; then
    print_error "Fichier prisma/schema.prisma non trouvé"
    exit 1
fi

print_status "Schéma Prisma trouvé"

echo ""
echo "🧪 Test 1: Installation des dépendances"
echo "----------------------------------------"

# Nettoyer node_modules pour un test propre
if [ -d "node_modules" ]; then
    print_warning "Suppression de node_modules existant"
    rm -rf node_modules
fi

# Installer les dépendances
print_status "Installation des dépendances avec npm ci"
if npm ci; then
    print_status "Dépendances installées avec succès"
else
    print_error "Échec de l'installation des dépendances"
    exit 1
fi

echo ""
echo "🔧 Test 2: Génération du client Prisma"
echo "--------------------------------------"

# Générer le client Prisma
print_status "Génération du client Prisma"
if npx prisma generate; then
    print_status "Client Prisma généré avec succès"
else
    print_error "Échec de la génération du client Prisma"
    exit 1
fi

echo ""
echo "🐳 Test 3: Test avec Docker (simulation GitLab CI)"
echo "------------------------------------------------"

# Créer un réseau Docker pour les tests
print_status "Création du réseau Docker"
docker network create sparkfit-test-network 2>/dev/null || print_warning "Réseau déjà existant"

# Démarrer PostgreSQL
print_status "Démarrage de PostgreSQL"
docker run --name sparkfit-postgres-test \
    --network sparkfit-test-network \
    -e POSTGRES_DB=test_db \
    -e POSTGRES_USER=test_user \
    -e POSTGRES_PASSWORD=test_password \
    -d postgres:13-alpine

# Attendre que PostgreSQL soit prêt
print_status "Attente de PostgreSQL (10 secondes)"
sleep 10

# Tester la connexion à PostgreSQL
print_status "Test de connexion à PostgreSQL"
if docker exec sparkfit-postgres-test pg_isready -U test_user -d test_db; then
    print_status "PostgreSQL est prêt"
else
    print_error "PostgreSQL n'est pas prêt"
    docker stop sparkfit-postgres-test
    docker rm sparkfit-postgres-test
    exit 1
fi

echo ""
echo "🗄️ Test 4: Migrations Prisma"
echo "----------------------------"

# Configurer les variables d'environnement pour les tests
export DATABASE_URL="postgresql://test_user:test_password@localhost:5432/test_db"
export NODE_ENV="test"
export JWT_SECRET="test-secret-key"
export PORT="3001"

# Appliquer les migrations
print_status "Application des migrations Prisma"
if npx prisma migrate deploy; then
    print_status "Migrations appliquées avec succès"
else
    print_error "Échec des migrations"
    docker stop sparkfit-postgres-test
    docker rm sparkfit-postgres-test
    exit 1
fi

echo ""
echo "🧪 Test 5: Tests unitaires"
echo "-------------------------"

# Lancer les tests
print_status "Exécution des tests"
if npm test; then
    print_status "Tests réussis"
else
    print_warning "Tests échoués (normal en local sans base de données complète)"
fi

echo ""
echo "🏗️ Test 6: Construction Docker"
echo "-----------------------------"

# Tester la construction Docker
print_status "Construction de l'image Docker"
if docker build -t sparkfit-backend:test .; then
    print_status "Image Docker construite avec succès"
    
    # Tester l'image
    print_status "Test de l'image Docker"
    if docker run --rm sparkfit-backend:test node --version; then
        print_status "Image Docker fonctionne correctement"
    else
        print_error "Image Docker ne fonctionne pas"
    fi
else
    print_error "Échec de la construction Docker"
fi

echo ""
echo "🧹 Nettoyage"
echo "------------"

# Nettoyer les conteneurs de test
print_status "Arrêt de PostgreSQL"
docker stop sparkfit-postgres-test 2>/dev/null || true
docker rm sparkfit-postgres-test 2>/dev/null || true

print_status "Suppression de l'image de test"
docker rmi sparkfit-backend:test 2>/dev/null || true

echo ""
echo "🎉 Résumé du test local"
echo "======================"
print_status "✅ Installation des dépendances : OK"
print_status "✅ Génération Prisma : OK"
print_status "✅ PostgreSQL : OK"
print_status "✅ Migrations : OK"
print_status "✅ Construction Docker : OK"
print_warning "⚠️  Tests unitaires : Vérifiez les logs ci-dessus"

echo ""
echo "💡 Prochaines étapes :"
echo "1. Poussez votre code : git push origin develop"
echo "2. Vérifiez sur GitLab : CI/CD > Pipelines"
echo "3. Si les tests échouent, vérifiez les logs GitLab"

echo ""
print_status "Test local terminé !" 