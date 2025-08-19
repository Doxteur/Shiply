FROM oven/bun:1 AS builder

WORKDIR /app

# Installation des dépendances (Bun)
COPY package.json ./
# Copie opportuniste des lockfiles s'ils existent (permet un cache de build plus fiable)
COPY bun.lockb* ./
COPY yarn.lock* ./
COPY package-lock.json* ./
COPY pnpm-lock.yaml* ./
RUN bun install --ci --no-progress

# Sources
COPY . .
COPY .env.example .env.example

# Si .env n'existe pas, on le crée à partir de .env.example
RUN [ -f .env ] || cp .env.example .env

# Build de l'application (AdonisJS)
RUN bun run build
RUN cp .env build/.env

# Préparer les dépendances de production dans le dossier build
WORKDIR /app/build
RUN bun install --ci --production --no-progress

FROM oven/bun:1

WORKDIR /app

COPY --from=builder /app/build ./

EXPOSE 3333

CMD ["bun", "bin/server.js"]
