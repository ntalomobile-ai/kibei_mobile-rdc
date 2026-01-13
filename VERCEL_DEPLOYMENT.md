# 🚀 Guide de Déploiement Vercel - KiBei

Ce guide vous explique comment déployer l'application KiBei sur Vercel. L'application est un monorepo avec deux applications Next.js à déployer séparément.

## 📋 Prérequis

- [ ] Compte Vercel créé ([vercel.com](https://vercel.com))
- [ ] Repository GitHub connecté
- [ ] Node.js >= 20 installé localement (pour tests)
- [ ] Variables d'environnement préparées (voir ci-dessous)

## 🏗️ Architecture de Déploiement

KiBei est un monorepo avec deux applications Next.js :

1. **API** (`apps/api`) - Backend API sur le port 3000
2. **Web** (`apps/web`) - Frontend Web sur le port 3001

Ces deux applications doivent être déployées comme **deux projets Vercel séparés**.

## 🔧 Étape 1 : Préparer les Variables d'Environnement

### Variables pour l'API (`apps/api`)

```env
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Database
DATABASE_URL=postgresql://user:pass@db.xxxxx.supabase.co:5432/postgres

# JWT
JWT_SECRET=votre-cle-secrete-min-32-caracteres
JWT_EXPIRY=900
JWT_REFRESH_EXPIRY=604800

# App URLs (Production)
NEXT_PUBLIC_API_URL=https://kibei-api.vercel.app
NEXT_PUBLIC_WEB_URL=https://kibei-web.vercel.app
NODE_ENV=production
```

### Variables pour le Web (`apps/web`)

```env
# App URLs (Production)
NEXT_PUBLIC_API_URL=https://kibei-api.vercel.app
NEXT_PUBLIC_WEB_URL=https://kibei-web.vercel.app
NODE_ENV=production
```

⚠️ **Important** : Les variables `SUPABASE_*`, `DATABASE_URL`, et `JWT_SECRET` doivent **UNIQUEMENT** être dans le projet API, pas dans le projet Web.

## 🚀 Étape 2 : Déployer l'API

### Option A : Via l'Interface Vercel (Recommandé)

1. **Connecter le Repository**
   - Allez sur [vercel.com/new](https://vercel.com/new)
   - Importez votre repository GitHub
   - Sélectionnez le repository `kibei`

2. **Configurer le Projet API**
   - **Project Name** : `kibei-api` (ou votre choix)
   - **Root Directory** : `apps/api`
   - **Framework Preset** : Next.js (détecté automatiquement)
   - **Build Command** : `cd ../.. && npm ci && cd apps/api && npm run build`
   - **Output Directory** : `.next` (par défaut)
   - **Install Command** : `cd ../.. && npm ci`

3. **Ajouter les Variables d'Environnement**
   - Dans **Settings** → **Environment Variables**
   - Ajoutez toutes les variables listées dans la section "Variables pour l'API"
   - Sélectionnez **Production**, **Preview**, et **Development**

4. **Déployer**
   - Cliquez sur **Deploy**
   - Attendez la fin du build
   - Notez l'URL de production (ex: `https://kibei-api.vercel.app`)

### Option B : Via Vercel CLI

```bash
# 1. Installer Vercel CLI
npm i -g vercel

# 2. Se connecter
vercel login

# 3. Aller dans le dossier API
cd apps/api

# 4. Déployer
vercel --prod

# 5. Suivre les instructions pour configurer:
# - Root directory: apps/api
# - Build command: cd ../.. && npm ci && cd apps/api && npm run build
```

## 🌐 Étape 3 : Déployer le Web

### Option A : Via l'Interface Vercel

1. **Créer un Nouveau Projet**
   - Allez sur [vercel.com/new](https://vercel.com/new)
   - Sélectionnez le **même repository** GitHub

2. **Configurer le Projet Web**
   - **Project Name** : `kibei-web` (ou votre choix)
   - **Root Directory** : `apps/web`
   - **Framework Preset** : Next.js (détecté automatiquement)
   - **Build Command** : `cd ../.. && npm ci && cd apps/web && npm run build`
   - **Output Directory** : `.next` (par défaut)
   - **Install Command** : `cd ../.. && npm ci`

3. **Ajouter les Variables d'Environnement**
   - Dans **Settings** → **Environment Variables**
   - Ajoutez uniquement les variables listées dans la section "Variables pour le Web"
   - ⚠️ **Important** : Utilisez l'URL de l'API déployée pour `NEXT_PUBLIC_API_URL`

4. **Déployer**
   - Cliquez sur **Deploy**
   - Attendez la fin du build
   - Notez l'URL de production (ex: `https://kibei-web.vercel.app`)

### Option B : Via Vercel CLI

```bash
# 1. Aller dans le dossier Web
cd apps/web

# 2. Déployer
vercel --prod

# 3. Suivre les instructions pour configurer:
# - Root directory: apps/web
# - Build command: cd ../.. && npm ci && cd apps/web && npm run build
```

## 🔄 Étape 4 : Mettre à Jour les URLs

Après avoir déployé les deux applications :

1. **Mettre à jour l'API**
   - Allez dans **Settings** → **Environment Variables** du projet API
   - Mettez à jour `NEXT_PUBLIC_API_URL` avec l'URL réelle de l'API
   - Mettez à jour `NEXT_PUBLIC_WEB_URL` avec l'URL réelle du Web
   - Redéployez l'API

2. **Mettre à jour le Web**
   - Allez dans **Settings** → **Environment Variables** du projet Web
   - Mettez à jour `NEXT_PUBLIC_API_URL` avec l'URL réelle de l'API
   - Mettez à jour `NEXT_PUBLIC_WEB_URL` avec l'URL réelle du Web
   - Redéployez le Web

## ✅ Vérification Post-Déploiement

### Vérifier l'API

1. **Health Check**
   ```bash
   curl https://kibei-api.vercel.app/api/public/provinces
   ```
   Devrait retourner une liste de provinces.

2. **Vérifier les Logs**
   - Allez dans Vercel Dashboard → Projet API → Deployments → [Dernier déploiement] → Functions Logs

### Vérifier le Web

1. **Accéder à l'Application**
   - Ouvrez `https://kibei-web.vercel.app`
   - Vérifiez que la page se charge

2. **Tester l'Authentification**
   - Essayez de vous connecter
   - Vérifiez que les appels API fonctionnent (onglet Network du navigateur)

## 🔧 Configuration Avancée

### Build Command Optimisé

Pour des builds plus rapides, vous pouvez utiliser :

**Pour l'API :**
```bash
cd ../.. && npm ci --prefer-offline --no-audit && cd apps/api && npm run build
```

**Pour le Web :**
```bash
cd ../.. && npm ci --prefer-offline --no-audit && cd apps/web && npm run build
```

### Variables d'Environnement par Environnement

Vous pouvez définir des variables différentes pour Production, Preview, et Development :

- **Production** : Variables pour la production
- **Preview** : Variables pour les Pull Requests (peuvent pointer vers staging)
- **Development** : Variables pour le développement local

### Domaine Personnalisé

1. Allez dans **Settings** → **Domains**
2. Ajoutez votre domaine personnalisé
3. Suivez les instructions DNS

## 🐛 Dépannage

### Erreur : "Cannot find module @kibei/..."

**Solution :**
- Vérifiez que le build command installe les dépendances depuis la racine
- Assurez-vous que `npm ci` s'exécute dans la racine du monorepo

### Erreur : "Prisma Client not generated"

**Solution :**
- Vérifiez que le script `postinstall` dans `apps/api/package.json` génère Prisma
- Ajoutez `prisma generate` dans le build command si nécessaire

### Erreur : "Build timeout"

**Solution :**
- Vercel a une limite de 45 minutes pour les builds
- Si votre build prend trop de temps, optimisez en :
  - Utilisant le cache de Turborepo
  - Réduisant les dépendances inutiles
  - Utilisant `npm ci` au lieu de `npm install`

### Variables d'Environnement Non Accessibles

**Solution :**
- Vérifiez que les variables sont définies pour le bon environnement (Production/Preview)
- Redéployez après avoir ajouté/modifié des variables
- Pour `NEXT_PUBLIC_*`, redéployez car elles sont injectées au build time

## 📊 Monitoring

### Vercel Analytics

1. Allez dans **Settings** → **Analytics**
2. Activez Vercel Analytics
3. Consultez les métriques dans le dashboard

### Logs

- **Build Logs** : Vercel Dashboard → Deployments → [Déploiement] → Build Logs
- **Function Logs** : Vercel Dashboard → Deployments → [Déploiement] → Functions Logs
- **Runtime Logs** : Vercel Dashboard → Deployments → [Déploiement] → Runtime Logs

## 🔐 Sécurité

### Bonnes Pratiques

1. **Ne jamais commiter** les variables d'environnement
2. **Utiliser des secrets différents** pour production et développement
3. **Limiter l'accès** aux variables sensibles dans Vercel
4. **Activer 2FA** sur votre compte Vercel
5. **Utiliser Vercel Secrets** pour les valeurs très sensibles

### Variables Sensibles

Ces variables ne doivent **JAMAIS** être exposées côté client :
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `JWT_SECRET`

## 📚 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Next.js sur Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Monorepos sur Vercel](https://vercel.com/docs/monorepos)
- [Variables d'Environnement Vercel](https://vercel.com/docs/environment-variables)

## 🆘 Support

Si vous rencontrez des problèmes :

1. Consultez les logs de build dans Vercel
2. Vérifiez la documentation Vercel
3. Créez une issue sur GitHub avec les détails de l'erreur

---

**Dernière mise à jour :** Décembre 2024
