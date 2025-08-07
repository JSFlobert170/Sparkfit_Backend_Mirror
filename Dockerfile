FROM node:18-alpine

WORKDIR /app

# Install git for cloning the prisma repo
RUN apk add --no-cache git

# Copy backend package files and install deps
COPY sparkfit_backend/package*.json ./
RUN npm install

# Copy backend source
COPY sparkfit_backend/ .

# Clone centralized prisma repo
RUN git clone https://${GITLAB_USER}:${GITLAB_TOKEN}@gitlab.com/JSFlobert/sparkfit_prisma-schema.git \
  && mkdir -p prisma \
  && cp sparkfit_prisma-schema/schema.prisma prisma/ \
  && rm -rf sparkfit_prisma-schema

# Generate prisma client
RUN npx prisma generate --schema=prisma/schema.prisma

# Entrypoint
COPY sparkfit_backend/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 3000
CMD ["sh", "/app/entrypoint.sh"]
