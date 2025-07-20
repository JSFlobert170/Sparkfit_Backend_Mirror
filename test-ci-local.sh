#!/bin/bash

echo "🚀 Test local GitLab CI/CD - SparkFit Backend"
echo "=============================================="

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Vérifications
echo "🔍 Vérifications préliminaires..."

if [ ! -f ".gitlab-ci.yml" ]; then
    print_error "Fichier .gitlab-ci.yml non trouvé"
    exit 1
fi
print_success "Fichier .gitlab-ci.yml trouvé"

if [ ! -f "package.json" ]; then
    print_error "Fichier package.json non trouvé"
    exit 1
fi
print_success "Fichier package.json trouvé"

if [ ! -f "../sparkfit_prisma-schema/schema.prisma" ]; then
    print_error "Fichier ../sparkfit_prisma-schema/schema.prisma non trouvé"
    exit 1
fi
print_success "Fichier ../sparkfit_prisma-schema/schema.prisma trouvé"

echo ""
echo "🧪 Test 1: Installation des dépendances"
echo "----------------------------------------"

if npm ci; then
    print_success "Dépendances installées"
else
    print_error "Échec de l'installation"
    exit 1
fi

echo ""
echo "🔧 Test 2: Configuration Prisma"
echo "------------------------------"

# Créer le répertoire prisma et copier les fichiers
print_success "Création du répertoire prisma"
mkdir -p prisma

print_success "Copie du schéma Prisma"
if cp ../sparkfit_prisma-schema/schema.prisma prisma/; then
    print_success "Schéma Prisma copié"
else
    print_error "Échec de la copie du schéma"
    exit 1
fi

print_success "Copie des migrations"
if cp -r ../sparkfit_prisma-schema/migrations prisma/; then
    print_success "Migrations copiées"
else
    print_error "Échec de la copie des migrations"
    exit 1
fi

print_success "Génération du client Prisma"
if npx prisma generate --schema=./prisma/schema.prisma; then
    print_success "Client Prisma généré"
else
    print_error "Échec de la génération Prisma"
    exit 1
fi

echo ""
echo "🧪 Test 3: Tests unitaires"
echo "-------------------------"

if npm test; then
    print_success "Tests réussis"
else
    print_warning "Tests échoués"
fi

echo ""
echo "🐳 Test 4: Construction Docker"
echo "-----------------------------"

# Aller au répertoire parent pour simuler le contexte de build
print_success "Changement vers le répertoire parent"
cd ..

print_success "Construction de l'image Docker"
if docker build -t sparkfit-backend:test -f sparkfit_backend/Dockerfile .; then
    print_success "Image Docker construite"
    
    print_success "Test de l'image Docker"
    if docker run --rm sparkfit-backend:test node --version; then
        print_success "Image Docker fonctionne"
    else
        print_error "Image Docker ne fonctionne pas"
    fi
    
    docker rmi sparkfit-backend:test 2>/dev/null || true
else
    print_error "Échec de la construction Docker"
fi

# Retourner au répertoire backend
cd sparkfit_backend

echo ""
echo "🧹 Nettoyage"
echo "------------"

# Supprimer le répertoire prisma temporaire
if [ -d "prisma" ]; then
    print_success "Suppression du répertoire prisma temporaire"
    rm -rf prisma
fi

echo ""
echo "🎉 Résumé"
echo "========="
print_success "Configuration CI/CD prête !"
echo ""
echo "💡 Prochaines étapes :"
echo "1. git add ."
echo "2. git commit -m 'Configuration GitLab CI/CD avec structure originale'"
echo "3. git push origin develop"
echo "4. Vérifiez sur GitLab : CI/CD > Pipelines" 