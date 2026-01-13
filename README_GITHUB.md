# 📦 Préparation pour GitHub

Ce guide vous aide à préparer votre projet pour le pousser sur GitHub.

## 🔧 Étapes préalables

### 1. Vérifier que Git est initialisé

```bash
# Vérifier le statut Git
git status
```

Si Git n'est pas initialisé:
```bash
git init
```

### 2. Vérifier les fichiers à ne pas commiter

Assurez-vous que votre `.gitignore` est à jour et contient:
- `node_modules/`
- `.env` et `.env.local`
- `.next/`
- `.turbo/`
- Les fichiers de logs
- Les fichiers sensibles

### 3. Créer un fichier .env.example (optionnel mais recommandé)

Créez un fichier `.env.example` à la racine avec les variables d'environnement nécessaires (sans les valeurs sensibles):

```env
# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database
DATABASE_URL=

# JWT
JWT_SECRET=
JWT_EXPIRY=900
JWT_REFRESH_EXPIRY=604800

# App URLs
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_WEB_URL=
NODE_ENV=development
```

## 📤 Pousser sur GitHub

### 1. Créer un repository sur GitHub

1. Allez sur [github.com](https://github.com)
2. Cliquez sur **"New repository"**
3. Donnez un nom à votre repository (ex: `kibei`)
4. Choisissez **Public** ou **Private**
5. **Ne cochez PAS** "Initialize with README" (vous avez déjà un README)
6. Cliquez sur **"Create repository"**

### 2. Ajouter le remote et pousser

```bash
# Ajouter le remote GitHub (remplacez par votre URL)
git remote add origin https://github.com/VOTRE_USERNAME/kibei.git

# Ou si vous utilisez SSH:
# git remote add origin git@github.com:VOTRE_USERNAME/kibei.git

# Vérifier le remote
git remote -v

# Ajouter tous les fichiers
git add .

# Créer le premier commit
git commit -m "Initial commit: Application KiBei prête pour déploiement Netlify"

# Renommer la branche principale en 'main' (si nécessaire)
git branch -M main

# Pousser sur GitHub
git push -u origin main
```

### 3. Vérifier que tout est bien poussé

1. Allez sur votre repository GitHub
2. Vérifiez que tous les fichiers sont présents:
   - ✅ `netlify.toml`
   - ✅ `.nvmrc`
   - ✅ `package.json`
   - ✅ `apps/web/package.json`
   - ✅ `turbo.json`
   - ✅ Tous les fichiers source

## 🔐 Sécurité

### ⚠️ IMPORTANT: Ne jamais commiter

- ❌ Fichiers `.env` ou `.env.local`
- ❌ Clés API ou secrets
- ❌ Mots de passe
- ❌ Certificats SSL
- ❌ Fichiers de configuration avec des credentials

### ✅ Utiliser GitHub Secrets (pour CI/CD)

Si vous utilisez GitHub Actions, vous pouvez stocker les secrets dans:
- **Settings** → **Secrets and variables** → **Actions**

## 📝 Structure recommandée du repository

```
kibei/
├── .gitignore          ✅
├── .nvmrc              ✅
├── netlify.toml        ✅
├── package.json        ✅
├── turbo.json          ✅
├── README.md           ✅
├── NETLIFY_DEPLOYMENT.md ✅
├── apps/
│   ├── web/
│   │   ├── package.json ✅
│   │   └── ...
│   └── api/
│       └── ...
├── packages/
│   └── ...
└── .env.example        ✅ (optionnel mais recommandé)
```

## 🚀 Prochaines étapes

Une fois votre code sur GitHub:

1. ✅ Suivez le guide [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md) pour déployer sur Netlify
2. ✅ Configurez les variables d'environnement dans Netlify
3. ✅ Testez votre déploiement

## 📚 Ressources

- [Documentation GitHub](https://docs.github.com/)
- [Git Basics](https://git-scm.com/book/en/v2/Getting-Started-Git-Basics)
- [GitHub CLI](https://cli.github.com/) (alternative à l'interface web)

---

**Note:** Si vous rencontrez des problèmes lors du push, vérifiez:
- Vos credentials GitHub sont corrects
- Vous avez les permissions sur le repository
- La taille des fichiers n'excède pas les limites GitHub (100MB par fichier)
