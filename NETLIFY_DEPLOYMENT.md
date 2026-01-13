# 🚀 Guide de Déploiement Netlify

Ce guide vous explique comment déployer l'application KiBei sur Netlify après l'avoir poussée sur GitHub.

## 📋 Prérequis

1. Un compte GitHub avec le repository de l'application
2. Un compte Netlify (gratuit disponible sur [netlify.com](https://www.netlify.com))
3. Les variables d'environnement nécessaires (voir ci-dessous)

## 🔧 Configuration GitHub

### 1. Initialiser le repository Git (si pas déjà fait)

```bash
# Vérifier si Git est déjà initialisé
git status

# Si non, initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Créer le premier commit
git commit -m "Initial commit: Préparation pour déploiement Netlify"

# Ajouter le remote GitHub (remplacer par votre URL)
git remote add origin https://github.com/VOTRE_USERNAME/kibei.git

# Pousser sur GitHub
git branch -M main
git push -u origin main
```

### 2. Vérifier que tous les fichiers sont commités

Assurez-vous que les fichiers suivants sont présents dans votre repository:
- ✅ `netlify.toml`
- ✅ `.nvmrc`
- ✅ `package.json`
- ✅ `apps/web/package.json`
- ✅ `turbo.json`
- ✅ Tous les fichiers source

## 🌐 Configuration Netlify

### Étape 1: Créer un nouveau site sur Netlify

1. Connectez-vous à [app.netlify.com](https://app.netlify.com)
2. Cliquez sur **"Add new site"** → **"Import an existing project"**
3. Choisissez **"GitHub"** comme provider
4. Autorisez Netlify à accéder à votre compte GitHub si demandé
5. Sélectionnez votre repository `kibei`

### Étape 2: Configurer les paramètres de build

Netlify devrait détecter automatiquement la configuration depuis `netlify.toml`, mais vérifiez ces paramètres:

**Build settings:**
- **Base directory:** `.` (racine du projet)
- **Build command:** `npm run build --workspace=kibei-web`
- **Publish directory:** `apps/web/.next`

**Note:** Si Netlify ne détecte pas automatiquement, entrez ces valeurs manuellement.

### Étape 3: Configurer les variables d'environnement

Dans les paramètres du site Netlify, allez dans **Site settings** → **Environment variables** et ajoutez:

#### Variables requises:

```env
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Database
DATABASE_URL=postgresql://user:pass@host:5432/kibei

# JWT
JWT_SECRET=votre-cle-secrete-min-32-caracteres
JWT_EXPIRY=900
JWT_REFRESH_EXPIRY=604800

# App URLs (Production)
NEXT_PUBLIC_API_URL=https://votre-api-url.com
NEXT_PUBLIC_WEB_URL=https://votre-site-netlify.netlify.app
NODE_ENV=production
```

#### Variables optionnelles:

```env
# Si vous utilisez d'autres services
SENTRY_DSN=...
ANALYTICS_ID=...
```

**⚠️ Important:** 
- Ne commitez JAMAIS ces variables dans Git
- Utilisez toujours les variables d'environnement Netlify pour les valeurs sensibles
- Pour `NEXT_PUBLIC_*`, ces variables seront exposées au client, soyez prudent

### Étape 4: Déployer

1. Cliquez sur **"Deploy site"**
2. Netlify va:
   - Cloner votre repository
   - Installer les dépendances (`npm install`)
   - Exécuter la commande de build
   - Déployer l'application

### Étape 5: Vérifier le déploiement

1. Attendez la fin du build (environ 3-5 minutes pour la première fois)
2. Si le build réussit, votre site sera disponible à l'URL: `https://votre-site.netlify.app`
3. Si le build échoue, consultez les logs de build dans Netlify

## 🔍 Dépannage

### Problème: Build échoue avec erreur de dépendances

**Solution:**
- Vérifiez que toutes les dépendances sont dans `package.json`
- Assurez-vous que `packageManager` est défini dans le `package.json` racine
- Vérifiez que Node.js version 20 est utilisée (via `.nvmrc`)

### Problème: Erreur "Cannot find module"

**Solution:**
- Vérifiez que tous les workspaces sont correctement configurés
- Assurez-vous que les packages locaux (`@kibei/*`) sont bien listés dans les `package.json`

### Problème: Variables d'environnement non trouvées

**Solution:**
- Vérifiez que toutes les variables sont définies dans Netlify
- Redéployez après avoir ajouté les variables
- Pour `NEXT_PUBLIC_*`, redéployez car elles sont injectées au build time

### Problème: Erreur de build Turbo

**Solution:**
- Vérifiez que `turbo.json` est présent
- Assurez-vous que la commande de build utilise `--workspace=kibei-web`

### Problème: Routes Next.js ne fonctionnent pas

**Solution:**
- Vérifiez que le plugin `@netlify/plugin-nextjs` est installé (Netlify l'installe automatiquement)
- Vérifiez la configuration dans `netlify.toml`

## 🔄 Déploiements automatiques

Netlify déploie automatiquement à chaque push sur la branche `main` (ou la branche que vous avez configurée).

### Branches de prévisualisation

Netlify crée automatiquement des déploiements de prévisualisation pour chaque Pull Request, permettant de tester les changements avant de les merger.

## 📝 Checklist de déploiement

Avant de déployer en production, vérifiez:

- [ ] Toutes les variables d'environnement sont configurées dans Netlify
- [ ] `NEXT_PUBLIC_API_URL` pointe vers votre API en production
- [ ] `NEXT_PUBLIC_WEB_URL` pointe vers votre URL Netlify
- [ ] La base de données est accessible depuis Netlify (vérifier les IP whitelist si nécessaire)
- [ ] Les secrets JWT sont suffisamment longs et sécurisés
- [ ] Le build local fonctionne (`npm run build --workspace=kibei-web`)
- [ ] Tous les tests passent (si vous en avez)
- [ ] Les routes publiques sont accessibles
- [ ] L'authentification fonctionne
- [ ] Les images et assets statiques se chargent correctement

## 🎯 Domaines personnalisés

Pour utiliser un domaine personnalisé:

1. Allez dans **Site settings** → **Domain management**
2. Cliquez sur **"Add custom domain"**
3. Suivez les instructions pour configurer votre DNS

## 📊 Monitoring

Netlify fournit:
- **Analytics:** Visiteurs, pages vues, etc.
- **Build logs:** Historique des builds
- **Deploy logs:** Logs de déploiement
- **Function logs:** Si vous utilisez des fonctions serverless

## 🔐 Sécurité

- ✅ HTTPS est activé automatiquement sur Netlify
- ✅ Les headers de sécurité sont configurés dans `netlify.toml`
- ⚠️ Vérifiez que les variables sensibles ne sont pas exposées côté client
- ⚠️ Utilisez `SUPABASE_SERVICE_ROLE_KEY` uniquement côté serveur (API routes)

## 📚 Ressources

- [Documentation Netlify](https://docs.netlify.com/)
- [Next.js sur Netlify](https://docs.netlify.com/integrations/frameworks/nextjs/)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)

## 🆘 Support

Si vous rencontrez des problèmes:
1. Consultez les logs de build dans Netlify
2. Vérifiez la documentation Netlify
3. Créez une issue sur GitHub avec les détails de l'erreur

---

**Dernière mise à jour:** Décembre 2024
