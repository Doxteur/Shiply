# RABV 🚀

![cover](https://i.ibb.co/27BDCTzV/image.png)

Une stack full-stack TypeScript moderne avec authentification JWT, utilisant **R**eact, **A**donisJS, **B**un et **V**ite.

## ✨ Fonctionnalités

- **🔐 Authentification JWT complète** avec hashage des mots de passe
- **🛡️ Routes protégées** avec middleware Bearer Auth
- **📊 Base de données** avec AdonisJS Lucid ORM et MySQL
- **🎨 Interface moderne** avec Framer Motion et Tailwind CSS
- **🔄 État global** avec Redux Toolkit
- **📱 Responsive Design** avec animations fluides
- **🔒 Sécurité** : Tokens JWT, hashage bcrypt, autorisation par utilisateur

## 🏗️ Architecture

```
RABV/
├── client/               # React frontend avec Redux
├── server/               # AdonisJS backend avec JWT
├── shared/               # Types TypeScript partagés
└── database/             # Migrations et seeders AdonisJS
```

## 🚀 Démarrage rapide

### Prérequis
- [Bun](https://bun.sh) installé
- MySQL en cours d'exécution

### Installation

```bash
# Cloner le projet
git clone <votre-repo>
cd RABV

# Installer les dépendances
bun install

# Configurer la base de données
cd server
cp .env.example .env
# Éditer .env avec vos paramètres de base de données

# Appliquer les migrations
bun ace migration:run

# Exécuter les seeders (optionnel)
bun ace db:seed
```

### Développement

```bash
# Démarrer tous les services
bun run dev

# Ou individuellement
bun run dev:client    # Frontend React (port 5173)
bun run dev:server    # Backend AdonisJS (port 3333)
```

## 🔐 API Authentication

### Créer un compte
```bash
curl -X POST http://localhost:3333/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "fullName": "John Doe",
    "password": "password123"
  }'
```

### Se connecter
```bash
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Routes protégées
```bash
# Récupérer le profil (nécessite un token)
curl -X GET http://localhost:3333/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Créer un post (nécessite un token)
curl -X POST http://localhost:3333/api/posts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mon premier post",
    "content": "Contenu du post"
  }'
```

## 📁 Structure du projet

### Frontend (client/)
```
client/src/
├── app/
│   ├── hooks/redux.ts      # Hooks Redux personnalisés
│   ├── reducers/           # Reducers Redux
│   └── store.ts           # Configuration du store
├── components/
│   ├── core/Layout.tsx    # Layout principal
│   └── ui/                # Composants UI (shadcn/ui)
├── pages/
│   ├── HomePage.tsx       # Page d'accueil
│   └── LoginPage.tsx      # Page de connexion
└── router.tsx             # Configuration des routes
```

### Backend (server/)
```
server/app/
├── controllers/
│   └── auth_controller.ts  # Authentification JWT
├── middleware/
│   └── auth_middleware.ts  # Middleware JWT
├── models/
│   └── user.ts            # Modèle User avec Lucid
├── validators/
│   └── auth.ts            # Validation des données
└── start/
    └── routes.ts          # Configuration des routes
```

### Base de données (AdonisJS Lucid)
```typescript
// Modèle User (app/models/user.ts)
export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  static accessTokens = DbAccessTokensProvider.forModel(User)
}
```

## 🛡️ Sécurité

- **JWT Tokens** : Expiration de 24h
- **Hashage des mots de passe** : Bcrypt avec configuration sécurisée
- **Routes protégées** : Middleware Bearer Auth automatique
- **Autorisation** : Vérification de propriété pour les opérations CRUD
- **Validation** : Vérification des données d'entrée

## 🎨 Interface utilisateur

- **Design moderne** avec Tailwind CSS
- **Animations fluides** avec Framer Motion
- **Composants réutilisables** avec shadcn/ui
- **Responsive** pour tous les appareils
- **Thème sombre/clair** supporté

## 📦 Technologies utilisées

### Frontend
- **React 18** avec TypeScript
- **Vite** pour le bundling
- **Redux Toolkit** pour l'état global
- **React Router** pour la navigation
- **Framer Motion** pour les animations
- **Tailwind CSS** pour le styling
- **shadcn/ui** pour les composants

### Backend
- **AdonisJS** framework web
- **Lucid ORM** pour la base de données
- **MySQL** base de données
- **JWT** authentification
- **Bcrypt** hashage des mots de passe

### Outils
- **Bun** runtime et package manager
- **Turbo** orchestration monorepo
- **TypeScript** end-to-end

## 🚀 Déploiement

### Frontend
```bash
cd client
bun run build
# Déployer le dossier dist/ sur votre plateforme
```

### Backend
```bash
cd server
bun run build
# Déployer avec Bun, Node.js ou Cloudflare Workers
```

## 📝 Scripts disponibles

```bash
# Développement
bun run dev              # Démarrer tous les services
bun run dev:client       # Frontend uniquement
bun run dev:server       # Backend uniquement

# Build
bun run build            # Build complet
bun run build:client     # Build frontend
bun run build:server     # Build backend

# Base de données
bun run db:generate      # Générer le client Prisma
bun run db:push          # Appliquer les migrations
bun run db:studio        # Ouvrir Prisma Studio

# Linting et tests
bun run lint             # Linter tous les packages
bun run type-check       # Vérification des types
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- [AdonisJS](https://adonisjs.com) pour le framework backend
- [shadcn/ui](https://ui.shadcn.com) pour les composants UI
- [Framer Motion](https://www.framer.com/motion/) pour les animations
- [Lucid ORM](https://docs.adonisjs.com/guides/models/introduction) pour l'ORM
