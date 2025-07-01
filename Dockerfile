# Utiliser l'image officielle Node.js comme image de base
FROM node:18-alpine

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances du projet
RUN npm install

COPY prisma ./prisma/

# Copier tous les fichiers locaux dans le conteneur
COPY . .

# Copier le script d'entrée et le rendre exécutable
COPY entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

# Exposer le port sur lequel votre app va tourner
EXPOSE 3000

# Commande pour démarrer votre application
# CMD ["node", "src/app.js"]
CMD ["/bin/sh", "entrypoint.sh"]

