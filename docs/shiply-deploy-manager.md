# Shiply Deploy Manager — Déploiements sans Coolify

Ce document remplace toute mention de Coolify par un orchestrateur interne: «Shiply Deploy Manager». Il définit le flux après pipeline, les modes de déploiement, et les attentes UI/API.

## Objectif
Permettre à Shiply de déployer une application après qu’un pipeline ait terminé (succès et/ou gate manuel), sans dépendre d’un outil externe.

## Flux après pipeline
1. Gate (optionnel): approbation manuelle du déploiement.
2. Déploiement via un «driver» choisi par projet/env:
   - compose: `docker compose up -d` basé sur `composePath` du repo.
   - dockerfile: build/push puis `docker run` (ou stack locale) basé sur `dockerfilePath`.
   - command: exécuter `startCommand` (pour environnements simples).
3. Smoke tests post-déploiement (health checks HTTP/ports).
4. Publication d’URLs utiles (app, API) + statut final.
5. Actions: rollback, re-run, promotion (staging → prod), tag/changelog (optionnel).

## Drivers de déploiement
- compose
  - Pré-requis: `composePath` dans `project.config` et repo cloné en workspace.
  - Action: `docker compose -f <composePath> up -d` à la racine `rootPath`.

- dockerfile
  - Pré-requis: `dockerfilePath` dans `project.config`.
  - Action: `docker build -t <image:tag> -f <dockerfilePath> .` puis `docker run …` ou compose minimal.

- command
  - Pré-requis: `startCommand` dans `project.config`.
  - Action: exécution directe de la commande (screen/tmux/systemd selon runner; MVP: process détaché).

## Intégration Runner
- Le runner dispose déjà d’un accès au Docker daemon (DOCKER_HOST). Pour les drivers compose/dockerfile, les commandes Docker s’exécutent directement via le daemon.
- Les déploiements référencent le workspace cloné: `WORKSPACE_DIR/project_<id>/<rootPath?>`.
- Les logs de déploiement sont streamés dans le run (job Deploy) comme les autres steps.

## Modèle de configuration projet (déjà en place)
`project.config` (JSON en base) contient:
- `runMode`: `command` | `dockerfile` | `compose`
- `startCommand`: string (optionnel)
- `dockerfilePath`: string (optionnel)
- `composePath`: string (optionnel)
- `rootPath`: string ("/" par défaut)
- `defaultBranch`: string
- `repositoryFullName`: string (org/repo)
- `envVars`: `{ key, value }[]`

## UI — RunDetails
- Bouton «Déployer» (si gate) déclenche le driver sélectionné.
- Affiche les logs de déploiement en temps réel (SSE).
- Cartes post-déploiement: «Ouvrir l’app», «Ouvrir l’API», «Rollback», «Promouvoir».

## Acceptation (MVP)
- Depuis un run OK, on peut déclencher un stage Deploy.
- Le driver `compose` amène en service les containers définis par `<composePath>`.
- Logs visibles en temps réel; statut agrégé du run mis à jour.
- Smoke test HTTP (configurable) et rendu du statut.

## À implémenter ensuite
- API endpoint POST `/runs/:id/deploy` avec `driver` auto-déduit depuis `project.config`.
- Runner: exécution du driver avec logs temps réel.
- UI: CTA «Déployer»/«Rollback»/«Promouvoir» + affichage endpoints.


