#!/bin/bash

# Script de construction Docker pour SparkFit Backend
# Ce script construit l'image avec le contexte à la racine pour accéder au schéma Prisma

set -e

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

# Variables par défaut
IMAGE_NAME="sparkfit-backend"
TAG="latest"
PUSH_IMAGE=false
REGISTRY=""

# Fonction d'aide
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -t, --tag TAG           Tag de l'image (défaut: latest)"
    echo "  -n, --name NAME         Nom de l'image (défaut: sparkfit-backend)"
    echo "  -p, --push              Pousser l'image après construction"
    echo "  -r, --registry REGISTRY Registry Docker (ex: registry.gitlab.com/username)"
    echo "  -h, --help              Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0                                    # Build simple"
    echo "  $0 -t v1.0.0                         # Build avec tag"
    echo "  $0 -t v1.0.0 -p                       # Build et push avec tag"
    echo "  $0 -r registry.gitlab.com/user -p     # Build et push vers registry"
}

# Parser les arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--tag)
            TAG="$2"
            shift 2
            ;;
        -n|--name)
            IMAGE_NAME="$2"
            shift 2
            ;;
        -p|--push)
            PUSH_IMAGE=true
            shift
            ;;
        -r|--registry)
            REGISTRY="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo "Option inconnue: $1"
            show_help
            exit 1
            ;;
    esac
done

print_status "INFO" "Construction de l'image Docker - SparkFit Backend"
echo "=================================================="
print_status "INFO" "Nom de l'image: $IMAGE_NAME:$TAG"
print_status "INFO" "Push après build: $PUSH_IMAGE"

# Vérifier que nous sommes dans le bon répertoire
if [[ ! -f "package.json" ]]; then
    print_status "ERROR" "Ce script doit être exécuté depuis le répertoire sparkfit_backend"
    exit 1
fi

# Vérifier que Docker est disponible
if ! command -v docker &> /dev/null; then
    print_status "ERROR" "Docker n'est pas installé ou n'est pas dans le PATH"
    exit 1
fi

# Vérifier que le Dockerfile existe
if [[ ! -f "Dockerfile" ]]; then
    print_status "ERROR" "Dockerfile non trouvé dans le répertoire courant"
    exit 1
fi

# Vérifier que le schéma Prisma existe à la racine
if [[ ! -d "../sparkfit_prisma-schema" ]]; then
    print_status "ERROR" "Répertoire sparkfit_prisma-schema non trouvé à la racine"
    exit 1
fi

if [[ ! -f "../sparkfit_prisma-schema/schema.prisma" ]]; then
    print_status "ERROR" "Fichier schema.prisma non trouvé dans sparkfit_prisma-schema"
    exit 1
fi

print_status "INFO" "Début de la construction avec contexte à la racine..."

# Construction du nom complet de l'image
if [[ -n "$REGISTRY" ]]; then
    FULL_IMAGE_NAME="$REGISTRY/$IMAGE_NAME:$TAG"
else
    FULL_IMAGE_NAME="$IMAGE_NAME:$TAG"
fi

# Construction de l'image avec le contexte à la racine
print_status "INFO" "Construction de l'image avec contexte à la racine..."
if docker build -f Dockerfile -t "$FULL_IMAGE_NAME" ..; then
    print_status "OK" "Construction réussie !"
else
    print_status "ERROR" "Échec de la construction"
    exit 1
fi

# Affichage des informations sur l'image
print_status "INFO" "Informations sur l'image construite:"
docker images "$FULL_IMAGE_NAME"

# Push de l'image si demandé
if [[ "$PUSH_IMAGE" == true ]]; then
    print_status "INFO" "Push de l'image vers le registry..."
    
    if [[ -n "$REGISTRY" ]]; then
        # Login au registry si nécessaire
        print_status "INFO" "Tentative de login au registry..."
        if docker login "$REGISTRY"; then
            print_status "OK" "Login réussi"
        else
            print_status "WARNING" "Login échoué, tentative de push sans authentification"
        fi
    fi
    
    if docker push "$FULL_IMAGE_NAME"; then
        print_status "OK" "Push réussi !"
    else
        print_status "ERROR" "Échec du push"
        exit 1
    fi
fi

# Nettoyage des images intermédiaires
print_status "INFO" "Nettoyage des images intermédiaires..."
docker image prune -f

print_status "OK" "Construction terminée avec succès !"
echo ""
print_status "INFO" "Pour exécuter l'image:"
echo "  docker run -p 3000:3000 $FULL_IMAGE_NAME"
echo ""
print_status "INFO" "Pour inspecter l'image:"
echo "  docker inspect $FULL_IMAGE_NAME" 