FROM node:18-alpine

WORKDIR /app

# Copier le package.json
COPY package*.json ./

RUN npm install

# Copier le code source
COPY . .

# Générer le client Prisma
RUN npx prisma generate

# Rendre le script d'entrée exécutable
RUN chmod +x start.sh

# Exposer le port sur lequel votre app va tourner
EXPOSE 3000

# Commande pour démarrer votre application
CMD ["/app/start.sh"]
