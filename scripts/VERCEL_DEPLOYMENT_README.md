# Guide de Déploiement Vercel - KiBei Web

Ce document explique comment déployer l'application Web KiBei sur Vercel.

## 📋 Configuration du Projet

### Settings Vercel

- **Root Directory** : `apps/web`
- **Framework** : Next.js
- **Output Directory** : `.next`
- **Install Command** : `cd ../..; npm ci --no-audit --no-fund`
- **Build Command** : `cd ../..; npm ci --no-audit --no-fund; npm run build --filter=kibei-web`

### Variables d'Environnement (Production)

Les variables suivantes doivent être configurées dans Vercel Dashboard :

- `NEXT_PUBLIC_API_URL` = `https://kibeimobile-rdc-api.vercel.app`
- `NEXT_PUBLIC_WEB_URL` = `https://kibeimobile-rdc-web.vercel.app`
- `NODE_ENV` = `production`

## 🚀 Scripts PowerShell Disponibles

### 1. Créer le Projet Vercel

```powershell
.\scripts\create_vercel_web.ps1 -Token "VOTRE_TOKEN_VERCEL"
```

Ce script :
- Crée le projet sur Vercel
- Configure les settings (root directory, commands, output)
- Ajoute les variables d'environnement publiques

### 2. Mettre à Jour les Settings et Déployer

```powershell
.\scripts\update_vercel_web_deploy.ps1 -Token "VOTRE_TOKEN_VERCEL" -ProjectId "prj_xxxxx"
```

Ce script :
- Met à jour les settings du projet (installCommand, buildCommand, rootDirectory, outputDirectory)
- Lance un nouveau déploiement en production via la CLI Vercel

## 📝 Notes Importantes

### Monorepo Structure

Le projet est un monorepo npm workspaces avec Turborepo. Les commandes de build doivent :
1. Aller à la racine du repo (`cd ../..` depuis `apps/web`)
2. Installer les dépendances (`npm ci`)
3. Builder uniquement le workspace `kibei-web` avec turbo (`npm run build --filter=kibei-web`)

### Build Command

La commande `npm run build --filter=kibei-web` :
- `npm run build` exécute `turbo build` (défini dans `package.json` racine)
- `--filter=kibei-web` filtre pour ne builder que le workspace `kibei-web`

### Dependencies Build Order

Turborepo garantit que les dépendances sont buildées dans le bon ordre :
1. Les packages (`@kibei/*`) sont buildés en premier
2. Ensuite `kibei-web` est buildé (qui dépend des packages)

### Troubleshooting

**Si le build échoue :**
1. Vérifiez les logs dans Vercel Dashboard
2. Vérifiez que toutes les dépendances sont installées (`npm ci`)
3. Vérifiez que le root directory est bien `apps/web`
4. Vérifiez que les variables d'environnement sont définies

**Si le build réussit mais l'app ne fonctionne pas :**
1. Vérifiez les variables d'environnement `NEXT_PUBLIC_*`
2. Vérifiez les logs de l'application dans Vercel
3. Vérifiez que l'API est accessible depuis l'URL de production

## 🔗 Liens Utiles

- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Turborepo](https://turbo.build/repo/docs)
- [Documentation Next.js](https://nextjs.org/docs)

