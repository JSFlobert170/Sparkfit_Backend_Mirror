FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache git

COPY package*.json ./

RUN npm install

COPY . .

# Cloner le schéma prisma avant la génération
RUN git clone https://JSFlobert:glpat-2btC-cB7hjKdciHsJzsZ@gitlab.com/JSFlobert/sparkfit_prisma-schema.git prisma-schema \
&& mkdir -p prisma \
&& cp prisma-schema/schema.prisma prisma/schema.prisma \
&& cp -r prisma-schema/migrations prisma/migrations

RUN npx prisma generate --schema=./prisma/schema.prisma


# Copier le script d'entrée et le rendre exécutable
# COPY entrypoint.sh /usr/local/bin/
# RUN chmod +x /usr/local/bin/entrypoint.sh

# Exposer le port sur lequel votre app va tourner
EXPOSE 3000

# Commande pour démarrer votre application
CMD ["node", "src/app.js"]
# CMD ["/bin/sh", "entrypoint.sh"]
