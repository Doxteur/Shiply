FROM oven/bun:1 AS builder

WORKDIR /app

COPY package*.json ./
RUN bun install

COPY . .
COPY .env.example .env.example

# Si .env n'existe pas, on le crée à partir de .env.example
RUN [ -f .env ] || cp .env.example .env

RUN bun run build
RUN cp .env build/.env

WORKDIR /app/build
RUN bun install --production

FROM oven/bun:1

WORKDIR /app

COPY --from=builder /app/build ./

EXPOSE 3333

CMD ["node", "bin/server.js"]
