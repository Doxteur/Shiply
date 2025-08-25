# Shiply — Récapitulatif pour ChatGPT

Ce fichier résume le projet afin de donner à ChatGPT le contexte nécessaire pour répondre efficacement aux questions techniques, écrire du code cohérent et produire la documentation.

## 1) Contexte & Objectif
Shiply est une plate‑forme CI/CD auto‑hébergeable (MVP) qui permet de créer, exécuter et suivre des pipelines (build, tests, qualité, sécurité, déploiement). Un runner exécute les jobs dans des conteneurs Docker et un « Deploy Manager » interne déclenche les déploiements via trois drivers: compose, dockerfile, command.

## 2) Stack & Monorepo
- Frontend: React + Vite + TypeScript + TailwindCSS + shadcn/ui (+ Redux Toolkit).
- API: AdonisJS (TypeScript), Lucid ORM (MySQL), JWT Access Tokens, SSE pour logs.
- Runner: Bun + dockerode, exécution des steps dans des conteneurs éphémères.
- Shared: types TypeScript partagés (contrats front/API/runner).
- Orchestration: turbo, Docker/Compose, GitHub Actions (CI/CD), Docker Hub.

Arborescence (haut niveau):
- `client/` (UI, router, pages Projects/ProjectDetails/RunDetails, Login/Register)
- `server/` (controllers, models, validators, services, routes, config, tests)
- `runner/` (logic runner, connexion Docker, exécution des jobs + logs)
- `shared/` (types TS)
- `docker-compose.yml` (dev), `docker-compose.prod.yml` (prod)

## 3) Fonctionnalités MVP
- Projets & Pipelines: création, config (repo GitHub, pipelinePath, runMode, env), synchronisation YAML depuis GitHub, validation schema (ajv).
- Exécutions (Runs/Jobs): steps conteneurisés, logs temps réel (SSE + pré‑chargement + fallback), agrégation des statuts (running/success/failed/canceled), annulation d’un run.
- Déploiement: job spécial `__shiply_deploy__:<driver>`, logs streamés, smoke test simple, publication d’URL.
- Nettoyage: suppression d’un projet (cascade DB + suppression du workspace disque).

## 4) API – Endpoints clés (exemples)
- Auth: `POST /auth/login`, `POST /auth/logout`.
- Projets: `GET/POST /projects`, `GET /projects/:id`, `DELETE /projects/:id`.
- Pipelines: `POST /projects/:id/pipelines/sync-repo` (sync YAML GitHub), `POST /pipelines/:id/run`.
- Runs/Jobs: `GET /runs/:id`, `POST /runs/:id/deploy`, `POST /runs/:id/cancel`, `GET /jobs/:id/context`.
- Logs: `GET /jobs/:id/logs` (SSE compatible), `GET /logs/:id` (pré‑chargement).
- Runners: `POST /runners/heartbeat`.
- Observabilité: `GET /metrics`, `GET /health`.

Remarque: la liste peut varier légèrement; se référer aux routes AdonisJS côté `server/start/routes.ts`.

## 5) Runner – Détails importants
- Connexion Docker auto‑détectée (DOCKER_HOST > named pipe Windows > Unix socket) + ping.
- Variables par défaut pour exécutions conteneur: `Tty: false`, `NO_COLOR=1`, `FORCE_COLOR=0`, `CI=1`, `TERM=dumb`.
- Montages: le workspace hôte est injecté dans le conteneur, respectant `WORKSPACE_DIR`.
- Annulation coopérative: arrêt des process/containers si le run passe en `canceled`.
- Drivers de déploiement: `compose`, `dockerfile`, `command`.

## 6) Configuration & Environnements
- Racine (`.env`): `HOST_WORKSPACE_DIR` (ex. Windows: `/run/desktop/mnt/host/d/Dev/Perso/deploy`, Linux: `/app/deploy`).
- API (`server/.env`): `APP_KEY` (clé Adonis, AES‑256‑GCM pour secrets), `HOST`, `PORT`, `DB_HOST/PORT/USER/PASSWORD/DATABASE`, OAuth GitHub optionnel.
- Windows: si Docker Desktop n’expose pas le socket, utiliser `DOCKER_HOST=tcp://localhost:2375`.

## 7) CI/CD
- CI (GitHub Actions): install → typecheck → lint → tests (≥80% modules touchés) → build images (front/api/runner) → Trivy → LHCI (front) → upload artefacts.
- CD: à chaque tag SemVer sur `main`, publication sur Docker Hub (`doxteurn/shiply-api:<tag>`, `doxteurn/shiply-nginx:<tag>`). En prod, `docker-compose.prod.yml` tire ces images puis `up -d`.
- GitFlow: `main` (versions taguées), `develop`, `feature/*`, `release/*`, `hotfix/*`, commits conventionnels.

## 8) Sécurité & A11y
- Sécurité: CORS strict, en‑têtes (Nginx/Adonis), secrets chiffrés AES‑256‑GCM (`CryptoService`), logs masqués, validations ajv.
- A11y: focus visible, labels reliés (`htmlFor`), contrastes shadcn/Tailwind, audits axe sur écrans clés.

## 9) Points d’attention (dev & prod)
- Docker Windows: souvent besoin d’activer le daemon TCP et d’exporter `DOCKER_HOST`.
- Sync GitHub 404: vérifier `repositoryFullName`, `defaultBranch`, `pipelinePath`, `rootPath`.
- Logs SSE: l’UI pré‑charge les logs existants puis passe au streaming; fallback polling prévu.
- Exécution locale: démarrer l’API avant le runner pour éviter les échecs de santé.

## 10) Démarrage rapide
- Dev: `bun install` (monorepo), `docker compose -f docker-compose.dev.yml up -d` (si utilisé), `bun run dev` (démarre server puis runner, client).
- Prod: renseigner `.env` (racine) et `server/.env`, puis `docker compose -f docker-compose.prod.yml pull && docker compose -f docker-compose.prod.yml up -d --remove-orphans`, exécuter `node ace migration:run --force` dans le conteneur API, vérifier `/health`.

## 11) Ce que ChatGPT doit respecter en réponse
- Toujours TypeScript strict et cohérent avec les types du dossier `shared`.
- Respecter la structure du monorepo et les conventions (Redux slices, controllers Adonis, services, etc.).
- Ne pas exposer de secrets; privilégier les variables d’environnement.
- Proposer des tests (Vitest/RTL côté front, Japa/supertest côté API) lors d’évolutions.
- Penser GitFlow (branche `feature/*`, PR vers `develop`, release → tag → CD).

## 12) Glossaire express
- Pipeline: YAML décrivant des stages/steps.
- Run: exécution d’un pipeline (suite de jobs).
- Job: step exécuté par le runner dans un conteneur.
- Driver: stratégie de déploiement (`compose`, `dockerfile`, `command`).
- Workspace: clone local du dépôt, monté dans les conteneurs.

Ce récapitulatif est la base de contexte pour toutes les futures réponses. Si une information manque, se référer aux fichiers du repo (controllers, services, routes, runner) et aux documents C2.x plus détaillés dans `docs/`.
