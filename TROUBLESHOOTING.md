# 🔧 Guide de Dépannage - KiBei

## Erreurs 401 (Unauthorized) - Normal si Non Connecté

### Symptôme
```
GET http://localhost:3001/api/auth/me 401 (Unauthorized)
```

### Explication
Cette erreur est **normale** si l'utilisateur n'est **pas connecté**. L'application vérifie automatiquement l'authentification au chargement, et si aucun cookie de session n'est présent, l'API retourne 401.

### Solution
✅ **Aucune action requise** - C'est le comportement attendu.

Les erreurs 401 sont maintenant gérées silencieusement dans le code pour éviter les logs inutiles dans la console.

### Vérification
1. **Si vous n'êtes pas connecté** : L'erreur 401 est normale, ignorez-la.
2. **Si vous êtes connecté** : Vérifiez que les cookies sont présents :
   - Ouvrez DevTools → Application → Cookies
   - Vérifiez que `accessToken` et `refreshToken` sont présents sur `localhost:3001`

## Erreur d'Image (ERR_NAME_NOT_RESOLVED)

### Symptôme
```
GET https://radiodelafemme.net/wp-content/uploads/2024/07/IMG-20240725-WA0013.jpg net::ERR_NAME_NOT_RESOLVED
```

### Explication
Une image est référencée avec une URL externe invalide ou inaccessible.

### Solution
1. **Vérifier les images dans le code** :
   - Cherchez les références à `radiodelafemme.net` ou `IMG-20240725-WA0013.jpg`
   - Remplacez par une image locale dans `apps/web/public/images/`

2. **Si l'image doit être externe** :
   - Vérifiez que l'URL est correcte et accessible
   - Ajoutez le domaine dans `next.config.js` si nécessaire :
   ```javascript
   images: {
     domains: ['radiodelafemme.net'],
   }
   ```

## Problème de Cookies Cross-Origin

### Symptôme
Les cookies ne sont pas partagés entre l'API (port 3000) et le Web (port 3001).

### Solution
✅ **Déjà corrigé** - Un proxy Next.js a été configuré pour rediriger les requêtes `/api/*` vers l'API backend en développement.

### Vérification
1. Vérifiez que `next.config.js` contient la configuration du proxy
2. Redémarrez le serveur Web après modification de `next.config.js`
3. Les requêtes doivent maintenant passer par `localhost:3001/api/*` (proxy)

## Le Proxy Ne Fonctionne Pas

### Symptôme
Les requêtes API échouent ou les cookies ne fonctionnent toujours pas.

### Solution
1. **Vérifier la configuration** :
   ```javascript
   // apps/web/next.config.js
   async rewrites() {
     const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
     
     if (process.env.NODE_ENV === 'development' && apiUrl.includes('localhost:3000')) {
       return [
         {
           source: '/api/:path*',
           destination: `${apiUrl}/api/:path*`,
         },
       ];
     }
     
     return [];
   }
   ```

2. **Redémarrer le serveur Web** :
   ```bash
   # Arrêter le serveur (Ctrl+C)
   cd apps/web
   npm run dev
   ```

3. **Vérifier les variables d'environnement** :
   - Assurez-vous que `NODE_ENV=development` (ou non défini en dev)
   - Vérifiez que `NEXT_PUBLIC_API_URL` pointe vers `http://localhost:3000`

## Erreurs de Build

### Symptôme
```
Error: Cannot find module '@kibei/...'
```

### Solution
1. **Installer les dépendances depuis la racine** :
   ```bash
   cd /chemin/vers/kibei
   npm install
   ```

2. **Rebuild les packages** :
   ```bash
   npm run build
   ```

## Erreurs Prisma

### Symptôme
```
Prisma Client not generated
```

### Solution
1. **Générer Prisma Client** :
   ```bash
   cd packages/db
   npm run generate
   ```

2. **Ou depuis la racine** :
   ```bash
   npm run db:push --workspace=@kibei/db
   ```

## Problèmes de Port

### Symptôme
```
Port 3000 is already in use
```

### Solution
1. **Trouver le processus** :
   ```bash
   # Windows
   netstat -ano | findstr :3000
   
   # Linux/Mac
   lsof -i :3000
   ```

2. **Arrêter le processus** ou utiliser un autre port :
   ```bash
   # Modifier le port dans package.json
   "dev": "next dev -p 3002"
   ```

## Vérification Rapide

### Checklist
- [ ] Les deux serveurs sont démarrés (API sur 3000, Web sur 3001)
- [ ] Les dépendances sont installées (`npm install` depuis la racine)
- [ ] Prisma Client est généré
- [ ] Les variables d'environnement sont configurées
- [ ] Le proxy est configuré dans `next.config.js`
- [ ] Les cookies sont présents après connexion

### Commandes Utiles
```bash
# Vérifier que tout fonctionne
npm run dev

# Vérifier les types
npm run type-check

# Linter
npm run lint

# Build
npm run build
```

## Support

Si le problème persiste :
1. Vérifiez les logs du serveur (API et Web)
2. Vérifiez la console du navigateur (F12)
3. Vérifiez les cookies dans DevTools → Application → Cookies
4. Consultez [FIXES_AUTHENTICATION.md](./FIXES_AUTHENTICATION.md) pour plus de détails

---

**Dernière mise à jour** : Décembre 2024
