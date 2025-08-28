![Aperçu Shiply](https://i.ibb.co/vvvkSQMt/chrome-OZDL2-ALmo-A.png)

# Note examinateur
La documentation du projet est disponible dans le dossier `docs`, le readme est présent uniquement pour le démarrage rapide.

## Démarrage rapide
Normalement un zip a été fournie, donc j'ai préconfigurer le projet pour qu'il fonctionne directement.
Il suffit de lancer la commande suivante:
- docker compose up -d --build

Compte de connexion:
- email: admin@admin.com
- password: password

Si vous avez un problème, vous pouvez me contacter à jimmydoussain@gmail.com.

# Shiply — CI/CD Manager (MVP)

Shiply est une application auto‑hébergeable pour créer, exécuter et suivre des pipelines (build, tests, qualité, sécurité, déploiement) avec des runners Docker et un orchestrateur de déploiement interne (Shiply Deploy Manager).

### Stack
- Frontend: React + Vite + TypeScript + Tailwind
- API: AdonisJS (TypeScript) + MySQL
- Runner: Bun + Docker
- Proxy: Nginx (sert le frontend et proxifie l’API en `/api`)

## Démarrage rapide (Docker)
Prérequis: Docker Desktop ou équivalent.

0) Créer un fichier `.env` à la racine (lu automatiquement par Docker Compose):
```env
# Emplacement du workspace monté par l'API et le runner
# Utilisez un chemin relatif pour rester portable
HOST_WORKSPACE_DIR=./workspace
ex windows: HOST_WORKSPACE_DIR=/run/desktop/mnt/host/d/Dev/Perso/deploy
```

1) Créer le fichier d’environnement API `server/.env` (exemple minimal):
```env
NODE_ENV=development
HOST=0.0.0.0
PORT=3333
APP_NAME=Shiply
APP_KEY=changeme_via_generate_key

# Base de données MySQL
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=example
DB_DATABASE=shiply

```

3) Lancer Shiply (proxy + API + runner):
```bash
docker compose up -d --build
```

4) Initialiser la base (dans le conteneur API):
```bash
docker exec -it shiply-api-dev node ace migration:fresh --seed
```

5) Ouvrir l’application:
- UI: `http://localhost:12002`
- API: `http://localhost:12000` (proxifiée en `/api` via Nginx sur `12002`)

Notes:
- L’API lit `server/.env`. L’APP_KEY peut être générée avec `node ace generate:key` dans le conteneur API, puis copiée dans `.env`.
- Le runner s’exécute dans `runner-dev` et parle au démon Docker via `docker.sock`.

## Développement local (sans Docker)
Prérequis: Bun (monorepo), Node.js, Docker (pour le runner), MySQL.

1) Installer les dépendances à la racine:
```bash
bun install
```

2) Préparer l’API:
```bash
cp server/.env server/.env.local  # ou créer manuellement selon l’exemple ci-dessus
cd server
node ace generate:key  # copier APP_KEY dans votre .env
node ace migration:run && node ace db:seed
bun run dev
```

3) Démarrer le frontend:
```bash
cd client
npm run dev  # ou bun run dev
```

4) Démarrer le runner (accès Docker requis):
```bash
cd runner
bun run dev
```

## Scripts utiles (racine)
```bash
bun run dev            # dev monorepo (turbo)
bun run dev:client     # frontend seul
bun run dev:server     # API seule
bun run dev:runner     # API + runner
bun run build          # build monorepo
```

## Structure du dépôt (mono‑repo)
- `client/`: UI React (Vite, Tailwind)
- `server/`: API AdonisJS (auth, projets, pipelines, runs, runners)
- `runner/`: exécution des jobs dans des conteneurs Docker
- `shared/`: types partagés TypeScript

## Fonctionnalités (MVP)
- Projets, pipelines YAML, exécutions, logs temps réel (SSE)
- Runners Docker (claim, exécution step‑par‑step)
- Déploiement via Shiply Deploy Manager (compose/dockerfile/command)

## Dépannage rapide
- API ne démarre pas: vérifier `server/.env` (hôte/port MySQL, `APP_KEY`).
- 500 DB: exécuter les migrations/seed, vérifier que MySQL est joignable.
- Runner: vérifier l’accès Docker (montage de `/var/run/docker.sock` ou Docker Desktop actif).

---
Licence: MIT

