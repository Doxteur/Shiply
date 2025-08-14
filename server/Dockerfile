FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN apk add --no-cache bash && corepack enable || true
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; else yarn install; fi

COPY . .
COPY .env.example .env.example

# Si .env n'existe pas, on le crée à partir de .env.example
RUN [ -f .env ] || cp .env.example .env

RUN yarn build
RUN cp .env build/.env

WORKDIR /app/build
RUN if [ -f yarn.lock ]; then yarn install --production=true --frozen-lockfile; else yarn install --production=true; fi

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/build ./

EXPOSE 3333

CMD ["node", "bin/server.js"]
