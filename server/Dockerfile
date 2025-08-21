FROM node:20-alpine AS builder
# Install Docker CLI
RUN apk add --no-cache docker-cli

WORKDIR /app

COPY package*.json ./
RUN yarn install

COPY . .

RUN yarn run build --ignore-ts-errors
RUN cp .env build/.env

WORKDIR /app/build
RUN yarn install --production

FROM node:22.7-alpine

WORKDIR /app

COPY --from=builder /app/build ./
COPY --from=builder /usr/bin/docker /usr/bin/

EXPOSE 3333

# Laisse le tourner dans le vide pour que j'accede le container
CMD ["node", "bin/server.js"]
