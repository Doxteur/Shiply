# Build stage pour le client React
FROM oven/bun:1 as client-builder

WORKDIR /app/client

# Copier les fichiers de dépendances du client
COPY client/package.json ./

# Installer les dépendances
RUN bun install

# Copier le code source du client
COPY client/ .

# Builder l'application React
RUN bun run build

# Stage final avec Nginx
FROM nginx:alpine

# Copier les fichiers statiques du client
COPY --from=client-builder /app/client/dist /usr/share/nginx/html

# Copier la configuration Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Exposer le port
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
