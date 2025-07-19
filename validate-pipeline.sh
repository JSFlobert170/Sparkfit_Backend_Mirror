#!/bin/bash

# Script de validation du pipeline GitLab CI/CD
# Ce script vérifie que tous les éléments nécessaires sont en place

set -e

echo "🔍 Validation du pipeline GitLab CI/CD - SparkFit Backend"
echo "=================================================="

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_status() {
    local status=$1
    local message=$2
    case $status in
        "OK")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "ERROR")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  $message${NC}"
            ;;
    esac
}

# Fonction pour vérifier si un fichier existe
check_file() {
    local file=$1
    local description=$2
    if [ -f "$file" ]; then
        print_status "OK" "$description trouvé: $file"
        return 0
    else
        print_status "ERROR" "$description manquant: $file"
        return 1
    fi
}

# Fonction pour vérifier si une commande est disponible
check_command() {
    local cmd=$1
    local description=$2
    if command -v "$cmd" &> /dev/null; then
        print_status "OK" "$description disponible: $cmd"
        return 0
    else
        print_status "WARNING" "$description non disponible: $cmd"
        return 1
    fi
}

# Variables pour le suivi des erreurs
errors=0
warnings=0

echo ""
print_status "INFO" "Vérification des fichiers de configuration..."

# Vérifier les fichiers essentiels
check_file ".gitlab-ci.yml" "Pipeline GitLab CI/CD" || ((errors++))
check_file "Dockerfile" "Dockerfile" || ((errors++))
check_file "package.json" "Package.json" || ((errors++))
check_file "entrypoint.sh" "Script d'entrée Docker" || ((errors++))
check_file "CI_CD_README.md" "Documentation CI/CD" || ((errors++))
check_file "env.example" "Fichier d'exemple des variables d'environnement" || ((warnings++))

echo ""
print_status "INFO" "Vérification de la structure du projet..."

# Vérifier la structure des répertoires
if [ -d "src" ]; then
    print_status "OK" "Répertoire src trouvé"
else
    print_status "ERROR" "Répertoire src manquant"
    ((errors++))
fi

if [ -d "tests" ]; then
    print_status "OK" "Répertoire tests trouvé"
else
    print_status "WARNING" "Répertoire tests manquant"
    ((warnings++))
fi

if [ -d "prisma" ]; then
    print_status "OK" "Répertoire prisma trouvé"
else
    print_status "WARNING" "Répertoire prisma manquant (sera copié depuis la racine)"
    ((warnings++))
fi

echo ""
print_status "INFO" "Vérification des dépendances..."

# Vérifier package.json
if [ -f "package.json" ]; then
    # Vérifier les scripts nécessaires
    if grep -q '"test"' package.json; then
        print_status "OK" "Script test trouvé dans package.json"
    else
        print_status "ERROR" "Script test manquant dans package.json"
        ((errors++))
    fi
    
    if grep -q '"test:coverage"' package.json; then
        print_status "OK" "Script test:coverage trouvé dans package.json"
    else
        print_status "WARNING" "Script test:coverage manquant dans package.json"
        ((warnings++))
    fi
    
    # Vérifier les dépendances essentielles
    if grep -q '"jest"' package.json; then
        print_status "OK" "Jest trouvé dans les dépendances"
    else
        print_status "ERROR" "Jest manquant dans les dépendances"
        ((errors++))
    fi
    
    if grep -q '"@prisma/client"' package.json; then
        print_status "OK" "Prisma Client trouvé dans les dépendances"
    else
        print_status "ERROR" "Prisma Client manquant dans les dépendances"
        ((errors++))
    fi
fi

echo ""
print_status "INFO" "Vérification de la syntaxe YAML..."

# Vérifier la syntaxe du pipeline GitLab CI
if command -v "yamllint" &> /dev/null; then
    if yamllint .gitlab-ci.yml &> /dev/null; then
        print_status "OK" "Syntaxe YAML du pipeline valide"
    else
        print_status "ERROR" "Erreur de syntaxe YAML dans le pipeline"
        ((errors++))
    fi
else
    print_status "WARNING" "yamllint non disponible, impossible de vérifier la syntaxe YAML"
    ((warnings++))
fi

echo ""
print_status "INFO" "Vérification des outils de développement..."

# Vérifier les outils de développement
check_command "node" "Node.js" || ((errors++))
check_command "npm" "npm" || ((errors++))
check_command "docker" "Docker" || ((warnings++))

# Vérifier la version de Node.js
if command -v "node" &> /dev/null; then
    node_version=$(node --version)
    print_status "INFO" "Version Node.js: $node_version"
fi

echo ""
print_status "INFO" "Vérification de la configuration Docker..."

# Vérifier le Dockerfile
if [ -f "Dockerfile" ]; then
    # Vérifier les éléments essentiels du Dockerfile
    if grep -q "FROM node" Dockerfile; then
        print_status "OK" "Image de base Node.js trouvée dans Dockerfile"
    else
        print_status "ERROR" "Image de base Node.js manquante dans Dockerfile"
        ((errors++))
    fi
    
    if grep -q "EXPOSE" Dockerfile; then
        print_status "OK" "Port exposé trouvé dans Dockerfile"
    else
        print_status "WARNING" "Aucun port exposé trouvé dans Dockerfile"
        ((warnings++))
    fi
    
    if grep -q "CMD" Dockerfile; then
        print_status "OK" "Commande de démarrage trouvée dans Dockerfile"
    else
        print_status "ERROR" "Commande de démarrage manquante dans Dockerfile"
        ((errors++))
    fi
fi

echo ""
print_status "INFO" "Vérification de la configuration Prisma..."

# Vérifier si le schéma Prisma existe à la racine
if [ -d "../sparkfit_prisma-schema" ]; then
    print_status "OK" "Répertoire sparkfit_prisma-schema trouvé à la racine"
    
    if [ -f "../sparkfit_prisma-schema/schema.prisma" ]; then
        print_status "OK" "Schéma Prisma trouvé"
    else
        print_status "ERROR" "Schéma Prisma manquant dans sparkfit_prisma-schema"
        ((errors++))
    fi
    
    if [ -d "../sparkfit_prisma-schema/migrations" ]; then
        print_status "OK" "Répertoire migrations trouvé"
    else
        print_status "WARNING" "Répertoire migrations manquant dans sparkfit_prisma-schema"
        ((warnings++))
    fi
else
    print_status "ERROR" "Répertoire sparkfit_prisma-schema manquant à la racine"
    ((errors++))
fi

echo ""
print_status "INFO" "Vérification des variables d'environnement..."

# Vérifier si un fichier .env existe
if [ -f ".env" ]; then
    print_status "WARNING" "Fichier .env trouvé (ne pas commiter ce fichier)"
    ((warnings++))
else
    print_status "OK" "Aucun fichier .env trouvé (correct)"
fi

echo ""
print_status "INFO" "Vérification de la sécurité..."

# Vérifier .gitignore
if [ -f ".gitignore" ]; then
    if grep -q "\.env" .gitignore; then
        print_status "OK" ".env est dans .gitignore"
    else
        print_status "WARNING" ".env n'est pas dans .gitignore"
        ((warnings++))
    fi
    
    if grep -q "node_modules" .gitignore; then
        print_status "OK" "node_modules est dans .gitignore"
    else
        print_status "WARNING" "node_modules n'est pas dans .gitignore"
        ((warnings++))
    fi
else
    print_status "WARNING" "Fichier .gitignore manquant"
    ((warnings++))
fi

echo ""
print_status "INFO" "Résumé de la validation..."

# Afficher le résumé
echo "=================================================="
if [ $errors -eq 0 ] && [ $warnings -eq 0 ]; then
    print_status "OK" "Validation réussie ! Aucune erreur ni avertissement."
    echo ""
    print_status "INFO" "Prochaines étapes :"
    echo "1. Configurer les variables d'environnement dans GitLab"
    echo "2. Activer le Container Registry dans GitLab"
    echo "3. Configurer les clés SSH pour le déploiement"
    echo "4. Tester le pipeline avec un commit"
    exit 0
elif [ $errors -eq 0 ]; then
    print_status "WARNING" "Validation terminée avec $warnings avertissement(s)"
    echo ""
    print_status "INFO" "Le pipeline devrait fonctionner, mais vérifiez les avertissements."
    exit 0
else
    print_status "ERROR" "Validation échouée avec $errors erreur(s) et $warnings avertissement(s)"
    echo ""
    print_status "INFO" "Corrigez les erreurs avant de déployer le pipeline."
    exit 1
fi 