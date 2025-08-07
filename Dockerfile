FROM node:18-alpine

WORKDIR /app

# Copier le package.json depuis le répertoire backend
COPY sparkfit_backend/package*.json ./

RUN npm install

# Copier le code source du backend
COPY sparkfit_backend/ .

RUN mkdir -p prisma
# Copier le schéma Prisma depuis la racine
COPY sparkfit_prisma-schema/schema.prisma ./prisma/schema.prisma
# COPY sparkfit_prisma-schema/migrations ./prisma/migrations

# Générer le client Prisma
# RUN npx prisma generate --schema=./prisma/schema.prisma
# RUN npx prisma migrate dev --schema=./prisma/schema.prisma --name migrations

# Copier le script d'entrée et le rendre exécutable
COPY sparkfit_backend/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Exposer le port sur lequel votre app va tourner
EXPOSE 3000

# Commande pour démarrer votre application
CMD ["/app/entrypoint.sh"]
