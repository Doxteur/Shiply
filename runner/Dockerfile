FROM oven/bun:1-alpine

WORKDIR /app

# Outils Docker (le runner parle au daemon via /var/run/docker.sock)
RUN apk add --no-cache docker-cli docker-cli-compose

# Installer uniquement les deps de prod pour éviter les workspaces/devDeps
COPY package.json ./
RUN bun install --production --no-frozen-lockfile

# Code du runner
COPY src ./src

CMD ["bun", "run", "src/index.ts"]


