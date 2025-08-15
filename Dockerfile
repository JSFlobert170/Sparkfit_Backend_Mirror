FROM node:18-alpine

WORKDIR /app

# Install git for cloning the prisma repo
RUN apk add --no-cache git

# Copy backend package files and install deps
COPY package*.json ./
RUN npm install

# Copy backend source
COPY . .

# Clone centralized prisma repo
RUN git clone https://${GITLAB_USER}:${GITLAB_TOKEN}@gitlab.com/JSFlobert/sparkfit_prisma-schema.git prisma-source \
  && mkdir -p prisma \
  && cp prisma-source/schema.prisma prisma/ \
  && rm -rf prisma-source


# Generate prisma client
RUN npx prisma generate --schema=prisma/schema.prisma

# Entrypoint
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 3000
CMD ["sh", "/app/entrypoint.sh"]
