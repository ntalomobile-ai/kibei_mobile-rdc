# Checklist de Déploiement Vercel - KiBei Web

Cette checklist vous guide à travers le processus de déploiement de l'application Web KiBei sur Vercel.

## 📋 Pré-requis

- [ ] Compte Vercel créé et connecté
- [ ] Token Vercel généré (Settings → Tokens)
- [ ] Repository GitHub connecté à Vercel
- [ ] Node.js >= 20 installé localement (pour tests)

## 🔧 Configuration Vercel

### 1. Créer le Projet (Si pas encore créé)

```powershell
.\scripts\create_vercel_web.ps1 -Token "VOTRE_TOKEN_VERCEL"
```

**Vérifications :**
- [ ] Projet créé avec succès
- [ ] Root Directory: `apps/web`
- [ ] Framework: Next.js détecté
- [ ] Variables d'environnement ajoutées

### 2. Vérifier les Settings du Projet

Dans Vercel Dashboard → Settings → General :

- [ ] **Root Directory**: `apps/web`
- [ ] **Framework Preset**: Next.js
- [ ] **Node Version**: 20.x (ou supérieur)

Dans Vercel Dashboard → Settings → Build & Development Settings :

- [ ] **Install Command**: `cd ../..; npm ci --no-audit --no-fund`
- [ ] **Build Command**: `cd ../..; npm ci --no-audit --no-fund; npm run build --filter=kibei-web`
- [ ] **Output Directory**: `.next`
- [ ] **Development Command**: (laisser vide ou par défaut)

### 3. Variables d'Environnement

Dans Vercel Dashboard → Settings → Environment Variables :

**Production uniquement :**
- [ ] `NEXT_PUBLIC_API_URL` = `https://kibeimobile-rdc-api.vercel.app`
- [ ] `NEXT_PUBLIC_WEB_URL` = `https://kibeimobile-rdc-web.vercel.app`
- [ ] `NODE_ENV` = `production`

**Si nécessaire (pour l'app web, généralement pas nécessaire) :**
- [ ] `SUPABASE_URL` = (si utilisé côté client)
- [ ] `SUPABASE_ANON_KEY` = (si utilisé côté client)

⚠️ **Note**: Les variables privées (JWT_SECRET, DATABASE_URL, etc.) doivent être dans le projet API, pas dans le projet Web.

## 🚀 Déploiement

### Option 1: Déploiement Automatique (Recommandé)

1. Push vers la branche `main` (ou la branche connectée)
2. Vercel détecte automatiquement le push
3. Le build se lance automatiquement
4. Vérifier les logs dans Vercel Dashboard → Deployments

### Option 2: Déploiement via Script

```powershell
.\scripts\update_vercel_web_deploy.ps1 -Token "VOTRE_TOKEN_VERCEL" -ProjectId "prj_xxxxx"
```

**Vérifications :**
- [ ] Settings mis à jour avec succès
- [ ] Déploiement lancé
- [ ] URL de production disponible

### Option 3: Déploiement via CLI

```powershell
cd apps/web
npx vercel --token="VOTRE_TOKEN_VERCEL" --prod --yes
```

## ✅ Post-Déploiement

### Vérifications

- [ ] L'application se charge sur l'URL de production
- [ ] Aucune erreur dans la console du navigateur
- [ ] Les appels API fonctionnent (vérifier Network tab)
- [ ] Les variables d'environnement `NEXT_PUBLIC_*` sont accessibles
- [ ] Le routing fonctionne correctement
- [ ] Les pages publiques sont accessibles
- [ ] L'authentification fonctionne (si applicable)

### Tests à Effectuer

- [ ] Page d'accueil se charge
- [ ] Navigation entre les pages fonctionne
- [ ] Formulaires fonctionnent
- [ ] Images et assets se chargent
- [ ] API calls réussissent
- [ ] Erreurs 404/500 sont gérées correctement

## 🔍 Troubleshooting

### Build échoue

1. **Vérifier les logs** dans Vercel Dashboard → Deployments → [Dernier déploiement] → Build Logs
2. **Erreurs communes :**
   - `Cannot find module`: Vérifier que `npm ci` s'exécute correctement
   - `Turbo build failed`: Vérifier que les packages sont buildés en premier
   - `Type errors`: Vérifier `tsconfig.json` et les types
3. **Clear Build Cache**: Settings → Build & Development Settings → Clear Build Cache → Redeploy

### Application ne se charge pas

1. **Vérifier les logs runtime**: Vercel Dashboard → Deployments → [Dernier déploiement] → Functions Logs
2. **Vérifier les variables d'environnement**: S'assurer qu'elles sont définies pour Production
3. **Vérifier la console du navigateur**: Erreurs JavaScript ou CORS
4. **Vérifier l'API**: S'assurer que l'API est déployée et accessible

### Variables d'environnement non accessibles

1. **Vérifier le préfixe**: Les variables côté client doivent commencer par `NEXT_PUBLIC_`
2. **Vérifier l'environnement**: Les variables doivent être définies pour `Production`
3. **Rebuild nécessaire**: Les changements de variables nécessitent un nouveau déploiement
4. **Vérifier dans le code**: Utiliser `process.env.NEXT_PUBLIC_XXX` côté client

## 📚 Ressources

- [Guide de Déploiement](VERCEL_DEPLOYMENT_README.md)
- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Turborepo](https://turbo.build/repo/docs)

## 🎯 Commandes Rapides

```powershell
# Créer le projet
.\scripts\create_vercel_web.ps1 -Token "TOKEN"

# Mettre à jour settings et déployer
.\scripts\update_vercel_web_deploy.ps1 -Token "TOKEN" -ProjectId "prj_xxx"

# Déployer via CLI
cd apps/web
npx vercel --token="TOKEN" --prod --yes

# Voir les logs
# Dans Vercel Dashboard → Deployments → [Dernier déploiement] → Logs
```


