#!/bin/sh

echo "Vérification du client Prisma..."

# Vérifier si le client Prisma existe
if [ ! -f "/app/node_modules/.prisma/client/index.js" ]; then
    echo "Génération du client Prisma..."
    npx prisma generate --schema=./prisma/schema.prisma
fi

echo "Démarrage de l'application..."
exec node src/app.js 