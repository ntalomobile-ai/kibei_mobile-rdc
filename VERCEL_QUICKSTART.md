# ⚡ Déploiement Vercel - Guide Rapide

Guide rapide pour déployer KiBei sur Vercel en 10 minutes.

## 🎯 Vue d'Ensemble

KiBei a **2 applications** à déployer séparément sur Vercel :

1. **API** (`apps/api`) → `https://kibei-api.vercel.app`
2. **Web** (`apps/web`) → `https://kibei-web.vercel.app`

## 📝 Checklist Pré-Déploiement

- [ ] Compte Vercel créé
- [ ] Repository GitHub prêt
- [ ] Variables d'environnement préparées (voir ci-dessous)

## 🚀 Déploiement en 3 Étapes

### Étape 1 : Déployer l'API

1. Allez sur [vercel.com/new](https://vercel.com/new)
2. Importez votre repository GitHub
3. **Configuration :**
   - **Project Name** : `kibei-api`
   - **Root Directory** : `apps/api`
   - **Framework** : Next.js (auto-détecté)
   - **Build Command** : `cd ../.. && npm ci && cd apps/api && npm run build`
   - **Install Command** : `cd ../.. && npm ci`

4. **Variables d'Environnement** (Settings → Environment Variables) :
   ```env
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   DATABASE_URL=postgresql://user:pass@db.xxxxx.supabase.co:5432/postgres
   JWT_SECRET=votre-cle-32-caracteres-minimum
   JWT_EXPIRY=900
   JWT_REFRESH_EXPIRY=604800
   NEXT_PUBLIC_API_URL=https://kibei-api.vercel.app
   NEXT_PUBLIC_WEB_URL=https://kibei-web.vercel.app
   NODE_ENV=production
   ```

5. Cliquez sur **Deploy**
6. Notez l'URL de production (ex: `https://kibei-api-xxx.vercel.app`)

### Étape 2 : Déployer le Web

1. Allez sur [vercel.com/new](https://vercel.com/new)
2. Sélectionnez le **même repository**
3. **Configuration :**
   - **Project Name** : `kibei-web`
   - **Root Directory** : `apps/web`
   - **Framework** : Next.js (auto-détecté)
   - **Build Command** : `cd ../.. && npm ci && cd apps/web && npm run build`
   - **Install Command** : `cd ../.. && npm ci`

4. **Variables d'Environnement** (Settings → Environment Variables) :
   ```env
   NEXT_PUBLIC_API_URL=https://kibei-api-xxx.vercel.app  # URL de l'API déployée
   NEXT_PUBLIC_WEB_URL=https://kibei-web-xxx.vercel.app  # URL du Web (après déploiement)
   NODE_ENV=production
   ```

5. Cliquez sur **Deploy**
6. Notez l'URL de production (ex: `https://kibei-web-xxx.vercel.app`)

### Étape 3 : Mettre à Jour les URLs

1. **Dans le projet API** : Mettez à jour `NEXT_PUBLIC_API_URL` et `NEXT_PUBLIC_WEB_URL` avec les vraies URLs
2. **Dans le projet Web** : Mettez à jour `NEXT_PUBLIC_API_URL` avec l'URL de l'API
3. **Redéployez** les deux projets

## ✅ Vérification

### Tester l'API
```bash
curl https://kibei-api-xxx.vercel.app/api/public/provinces
```

### Tester le Web
Ouvrez `https://kibei-web-xxx.vercel.app` dans votre navigateur.

## 🐛 Problèmes Courants

### "Cannot find module @kibei/..."
**Solution** : Vérifiez que `npm ci` s'exécute depuis la racine du monorepo.

### "Prisma Client not generated"
**Solution** : Le script `postinstall` dans `apps/api/package.json` devrait générer Prisma automatiquement.

### Variables d'environnement non accessibles
**Solution** : Redéployez après avoir ajouté/modifié des variables.

## 📚 Documentation Complète

Pour plus de détails, consultez [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md).

---

**Temps estimé** : 10-15 minutes  
**Difficulté** : ⭐⭐ (Facile)
