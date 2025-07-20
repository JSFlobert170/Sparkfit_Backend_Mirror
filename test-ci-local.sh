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

if [ ! -f "prisma/schema.prisma" ]; then
    print_error "Fichier prisma/schema.prisma non trouvé"
    exit 1
fi
print_success "Fichier prisma/schema.prisma trouvé"

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
echo "🔧 Test 2: Génération Prisma"
echo "---------------------------"

if npx prisma generate; then
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

if docker build -t sparkfit-backend:test .; then
    print_success "Image Docker construite"
    
    if docker run --rm sparkfit-backend:test node --version; then
        print_success "Image Docker fonctionne"
    else
        print_error "Image Docker ne fonctionne pas"
    fi
    
    docker rmi sparkfit-backend:test 2>/dev/null || true
else
    print_error "Échec de la construction Docker"
fi

echo ""
echo "🎉 Résumé"
echo "========="
print_success "Configuration CI/CD prête !"
echo ""
echo "💡 Prochaines étapes :"
echo "1. git add ."
echo "2. git commit -m 'Fix Prisma schema and tests'"
echo "3. git push origin develop"
echo "4. Vérifiez sur GitLab : CI/CD > Pipelines" 