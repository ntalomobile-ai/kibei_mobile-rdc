# Guide de Configuration Vercel pour KiBei

## 📋 Configuration pour Monorepo

Votre projet est un monorepo avec deux applications Next.js :
- **API** : `apps/api` (port 3000)
- **Web** : `apps/web` (port 3001)

## 🚀 Option 1 : Deux Projets Séparés (Recommandé)

### Projet 1 : API

1. **Dans Vercel Dashboard** :
   - Cliquez sur "Add New Project"
   - Importez le dépôt GitHub `gexpress833-del/kibeimobile-rdc`
   - **Root Directory** : `apps/api`
   - **Framework Preset** : Next.js
   - **Build Command** : `cd ../.. && npm install && npm run build --filter=kibei-api`
   - **Output Directory** : `.next`
   - **Install Command** : `cd ../.. && npm install`

2. **Variables d'environnement** à ajouter :
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=votre-cle-secrete-32-caracteres-minimum
   JWT_EXPIRY=900
   JWT_REFRESH_EXPIRY=604800
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://votre-api.vercel.app
   NEXT_PUBLIC_WEB_URL=https://votre-web.vercel.app
   ```

### Projet 2 : Web

1. **Dans Vercel Dashboard** :
   - Cliquez sur "Add New Project"
   - Importez le même dépôt GitHub `gexpress833-del/kibeimobile-rdc`
   - **Root Directory** : `apps/web`
   - **Framework Preset** : Next.js
   - **Build Command** : `cd ../.. && npm install && npm run build --filter=kibei-web`
   - **Output Directory** : `.next`
   - **Install Command** : `cd ../.. && npm install`

2. **Variables d'environnement** à ajouter :
   ```
   NEXT_PUBLIC_API_URL=https://votre-api.vercel.app
   NEXT_PUBLIC_WEB_URL=https://votre-web.vercel.app
   NODE_ENV=production
   ```

## 🔧 Option 2 : Configuration Monorepo (Alternative)

Si vous préférez un seul projet, utilisez la configuration ci-dessous dans Vercel :

**Root Directory** : `.` (racine du monorepo)

**Build Command** :
```bash
npm install && npm run build --filter=kibei-api --filter=kibei-web
```

**Output Directory** : `apps/api/.next` ou `apps/web/.next` (selon l'app)

⚠️ **Note** : Cette option est plus complexe et moins recommandée pour deux applications distinctes.

## 📝 Étapes Détaillées

### 1. Créer le Projet API

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur "Add New Project"
3. Importez `gexpress833-del/kibeimobile-rdc`
4. Configurez :
   - **Project Name** : `kibei-api` (ou `kibeimmobile-rdc-api`)
   - **Root Directory** : `apps/api`
   - **Framework** : Next.js (détecté automatiquement)
   - **Build Command** : `cd ../.. && npm install && npm run build --filter=kibei-api`
   - **Output Directory** : `.next`
   - **Install Command** : `cd ../.. && npm install`

5. Ajoutez les variables d'environnement (voir ci-dessus)

6. Cliquez sur "Deploy"

### 2. Créer le Projet Web

1. Répétez les étapes pour créer un deuxième projet
2. Configurez :
   - **Project Name** : `kibei-web` (ou `kibeimmobile-rdc-web`)
   - **Root Directory** : `apps/web`
   - **Build Command** : `cd ../.. && npm install && npm run build --filter=kibei-web`
   - **Output Directory** : `.next`

3. Ajoutez les variables d'environnement avec l'URL de l'API déployée

4. Cliquez sur "Deploy"

## ⚙️ Configuration Post-Déploiement

Après le déploiement :

1. **Mettre à jour les URLs** :
   - Dans le projet Web, mettez à jour `NEXT_PUBLIC_API_URL` avec l'URL de l'API déployée
   - Dans le projet API, mettez à jour `NEXT_PUBLIC_WEB_URL` avec l'URL du Web déployé

2. **Redéployer** pour que les changements prennent effet

## 🔍 Vérification

Après le déploiement, vérifiez :
- ✅ L'API répond sur `https://votre-api.vercel.app`
- ✅ Le Web répond sur `https://votre-web.vercel.app`
- ✅ Les variables d'environnement sont correctement configurées
- ✅ La connexion à la base de données fonctionne

## 🐛 Dépannage

Si le build échoue :
1. Vérifiez les logs de build dans Vercel
2. Assurez-vous que `package.json` contient les bons scripts
3. Vérifiez que les dépendances sont installées correctement
4. Vérifiez que Prisma est généré avant le build

