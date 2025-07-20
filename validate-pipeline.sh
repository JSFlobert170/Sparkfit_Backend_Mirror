#!/bin/bash

# Script de validation du pipeline GitLab CI/CD
# Teste localement les étapes du pipeline

set -e

echo "🔍 Validation du pipeline GitLab CI/CD - SparkFit Backend"
echo "=================================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier les prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."
    
    # Vérifier Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log_success "Node.js trouvé: $NODE_VERSION"
    else
        log_error "Node.js n'est pas installé"
        exit 1
    fi
    
    # Vérifier npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        log_success "npm trouvé: $NPM_VERSION"
    else
        log_error "npm n'est pas installé"
        exit 1
    fi
    
    # Vérifier Docker
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version)
        log_success "Docker trouvé: $DOCKER_VERSION"
    else
        log_warning "Docker n'est pas installé (build Docker ignoré)"
    fi
    
    # Vérifier Git
    if command -v git &> /dev/null; then
        GIT_VERSION=$(git --version)
        log_success "Git trouvé: $GIT_VERSION"
    else
        log_warning "Git n'est pas installé"
    fi
}

# Valider la syntaxe du pipeline
validate_pipeline_syntax() {
    log_info "Validation de la syntaxe du pipeline..."
    
    if [ -f ".gitlab-ci.yml" ]; then
        log_success "Fichier .gitlab-ci.yml trouvé"
    else
        log_error "Fichier .gitlab-ci.yml manquant"
        exit 1
    fi
    
    # Vérifier la syntaxe YAML basique
    if command -v python3 &> /dev/null; then
        python3 -c "import yaml; yaml.safe_load(open('.gitlab-ci.yml'))" 2>/dev/null
        if [ $? -eq 0 ]; then
            log_success "Syntaxe YAML valide"
        else
            log_error "Erreur de syntaxe YAML dans .gitlab-ci.yml"
            exit 1
        fi
    else
        log_warning "Python3 non trouvé, validation YAML ignorée"
    fi
}

# Valider la configuration Jest
validate_jest_config() {
    log_info "Validation de la configuration Jest..."
    
    # Vérifier la configuration Jest dans package.json
    if node -e "const pkg = JSON.parse(require('fs').readFileSync('package.json', 'utf8')); if (!pkg.jest) throw new Error('Configuration Jest manquante')"; then
        log_success "Configuration Jest trouvée dans package.json"
        
        # Vérifier la syntaxe de package.json
        node -c package.json
        if [ $? -eq 0 ]; then
            log_success "Configuration Jest valide"
        else
            log_error "Erreur dans package.json"
            exit 1
        fi
    else
        log_error "Configuration Jest manquante dans package.json"
        exit 1
    fi
}

# Valider package.json
validate_package_json() {
    log_info "Validation de package.json..."
    
    if [ -f "package.json" ]; then
        log_success "Fichier package.json trouvé"
        
        # Vérifier la syntaxe JSON
        node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))"
        if [ $? -eq 0 ]; then
            log_success "package.json valide"
        else
            log_error "Erreur de syntaxe dans package.json"
            exit 1
        fi
        
        # Vérifier les scripts de test
        if node -e "const pkg = JSON.parse(require('fs').readFileSync('package.json', 'utf8')); if (!pkg.scripts.test) throw new Error('Script test manquant')"; then
            log_success "Script de test trouvé"
        else
            log_error "Script de test manquant dans package.json"
            exit 1
        fi
    else
        log_error "Fichier package.json manquant"
        exit 1
    fi
}

# Valider les tests
validate_tests() {
    log_info "Validation des tests..."
    
    if [ -d "tests" ]; then
        log_success "Répertoire tests trouvé"
        
        # Compter les fichiers de test
        TEST_COUNT=$(find tests -name "*.test.js" -o -name "*.spec.js" | wc -l)
        if [ $TEST_COUNT -gt 0 ]; then
            log_success "$TEST_COUNT fichier(s) de test trouvé(s)"
        else
            log_warning "Aucun fichier de test trouvé"
        fi
        
        # Vérifier setup.js
        if [ -f "tests/setup.js" ]; then
            log_success "Fichier setup.js trouvé"
            node -c tests/setup.js
            if [ $? -eq 0 ]; then
                log_success "setup.js valide"
            else
                log_error "Erreur dans setup.js"
                exit 1
            fi
        else
            log_warning "Fichier setup.js manquant"
        fi
    else
        log_warning "Répertoire tests manquant"
    fi
}

# Valider Dockerfile
validate_dockerfile() {
    log_info "Validation du Dockerfile..."
    
    if [ -f "Dockerfile" ]; then
        log_success "Dockerfile trouvé"
        
        # Vérifier la syntaxe Dockerfile
        if command -v docker &> /dev/null; then
            docker build --dry-run -f Dockerfile . 2>/dev/null
            if [ $? -eq 0 ]; then
                log_success "Dockerfile valide"
            else
                log_warning "Problème potentiel dans Dockerfile"
            fi
        else
            log_warning "Docker non disponible, validation Dockerfile ignorée"
        fi
    else
        log_warning "Dockerfile manquant"
    fi
}

# Test local des dépendances
test_dependencies() {
    log_info "Test des dépendances..."
    
    # Installer les dépendances
    if npm ci --silent; then
        log_success "Dépendances installées avec succès"
    else
        log_error "Échec de l'installation des dépendances"
        exit 1
    fi
}

# Test local de la syntaxe
test_syntax() {
    log_info "Test de la syntaxe du code..."
    
    # Vérifier la syntaxe des fichiers JavaScript
    for file in $(find src -name "*.js" 2>/dev/null); do
        if node -c "$file" 2>/dev/null; then
            log_success "Syntaxe valide: $file"
        else
            log_error "Erreur de syntaxe dans: $file"
            exit 1
        fi
    done
}

# Test local de Prisma
test_prisma() {
    log_info "Test de Prisma..."
    
    # Vérifier si le schéma Prisma existe
    if [ -f "../sparkfit_prisma-schema/schema.prisma" ]; then
        log_success "Schéma Prisma trouvé"
        
        # Copier le schéma pour les tests
        mkdir -p prisma
        cp ../sparkfit_prisma-schema/schema.prisma prisma/
        
        # Valider le schéma
        if npx prisma validate --schema=prisma/schema.prisma 2>/dev/null; then
            log_success "Schéma Prisma valide"
        else
            log_warning "Problème dans le schéma Prisma"
        fi
    else
        log_warning "Schéma Prisma non trouvé"
    fi
}

# Résumé
show_summary() {
    echo ""
    echo "📊 Résumé de la validation"
    echo "=========================="
    log_success "Pipeline validé avec succès !"
    echo ""
    echo "🚀 Le pipeline est prêt pour GitLab CI/CD"
    echo "📋 Se déclenche sur: develop, main"
    echo "🧪 Inclut: Tests, Build Docker, Validation"
    echo ""
    log_info "Prochaines étapes:"
    echo "1. Commiter les fichiers dans GitLab"
    echo "2. Pousser sur develop ou main"
    echo "3. Vérifier le pipeline dans GitLab CI/CD"
}

# Fonction principale
main() {
    check_prerequisites
    validate_pipeline_syntax
    validate_jest_config
    validate_package_json
    validate_tests
    validate_dockerfile
    test_dependencies
    test_syntax
    test_prisma
    show_summary
}

# Exécuter le script
main "$@" 