# Différences entre Local et Production

## 🔍 Pourquoi ça marche en local mais pas en production ?

Plusieurs raisons peuvent expliquer ces différences :

### 1. **Cache de Build**
- **Local** : Le cache peut être vidé facilement avec `npm run build -- --no-cache`
- **Production (Vercel)** : Le cache persiste entre les builds et peut contenir d'anciennes versions
- **Solution** : Vider le cache de build dans les paramètres Vercel

### 2. **Versions de Node.js**
- **Local** : Vous utilisez peut-être Node.js 20.x ou 22.x
- **Production (Vercel)** : Peut utiliser une version différente (vérifiez dans les paramètres)
- **Solution** : Spécifier la version dans `package.json` :
  ```json
  "engines": {
    "node": ">=20.0.0"
  }
  ```

### 3. **Variables d'Environnement**
- **Local** : Variables dans `.env.local` (non versionnées)
- **Production** : Variables doivent être configurées dans Vercel Dashboard
- **Solution** : Vérifier que toutes les variables nécessaires sont configurées sur Vercel

### 4. **Fichiers Non Commités**
- **Local** : Vous pouvez avoir des fichiers non commités qui fonctionnent
- **Production** : Seuls les fichiers commités sont déployés
- **Solution** : Vérifier avec `git status` et commit tous les fichiers nécessaires

### 5. **Dépendances**
- **Local** : `node_modules` peut contenir des versions différentes
- **Production** : Installe les dépendances depuis `package.json` et `package-lock.json`
- **Solution** : Utiliser `package-lock.json` pour verrouiller les versions

### 6. **Configuration TypeScript/ESLint**
- **Local** : Peut ignorer certaines erreurs
- **Production** : Build strict, toutes les erreurs bloquent
- **Solution** : Vérifier avec `npm run type-check` et `npm run lint` avant de commit

### 7. **Prisma Client**
- **Local** : Prisma client peut être généré différemment
- **Production** : Doit générer le client avant le build
- **Solution** : S'assurer que `prisma generate` est dans le script de build

## ✅ Checklist pour éviter les problèmes

- [ ] Tous les fichiers sont commités (`git status` doit être propre)
- [ ] Les variables d'environnement sont configurées sur Vercel
- [ ] La version Node.js est spécifiée dans `package.json`
- [ ] `npm run type-check` passe sans erreur
- [ ] `npm run lint` passe sans erreur
- [ ] `npm run build` fonctionne en local
- [ ] Le cache Vercel a été vidé si nécessaire

## 🛠️ Commandes utiles

```bash
# Vérifier les erreurs TypeScript
npm run type-check

# Vérifier les erreurs ESLint
npm run lint

# Build local pour tester
npm run build

# Vérifier les fichiers non commités
git status

# Vérifier les différences
git diff
```

