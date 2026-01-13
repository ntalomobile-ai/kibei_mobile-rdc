# 🔧 Corrections des Erreurs d'Authentification

## Problèmes Identifiés

### 1. Erreur 401 sur `/api/auth/refresh`
**Cause** : Les cookies ne sont pas partagés entre `localhost:3000` (API) et `localhost:3001` (Web) en développement. Les navigateurs bloquent les cookies cross-origin par sécurité.

**Solution** : Configuration d'un proxy Next.js qui redirige toutes les requêtes `/api/*` vers l'API backend. Ainsi, les requêtes passent par le même port (3001) et les cookies fonctionnent correctement.

### 2. Avertissement DOM sur autocomplete
**Cause** : Les champs password n'avaient pas d'attribut `autocomplete`.

**Solution** : Ajout de `autoComplete="current-password"` pour le login et `autoComplete="new-password"` pour l'inscription.

### 3. Gestion d'erreur du refresh token
**Cause** : Les erreurs de refresh token étaient trop génériques et causaient des logs inutiles.

**Solution** : Amélioration de la gestion d'erreur pour distinguer les cas normaux (pas de refresh token si pas connecté) des vraies erreurs.

## Modifications Apportées

### 1. `apps/web/next.config.js`
Ajout d'un proxy pour rediriger les requêtes API en développement :

```javascript
async rewrites() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  
  // Only proxy in development when API is on a different port
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

### 2. `apps/web/lib/auth.ts` et `apps/web/lib/api.ts`
Mise à jour de `API_BASE_URL` pour utiliser le proxy en développement :

```typescript
const API_BASE_URL = 
  process.env.NODE_ENV === 'development' 
    ? '' // Use proxy in development (rewrites in next.config.js)
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000');
```

### 3. Amélioration de `refreshSession()`
Meilleure gestion des erreurs :

```typescript
export async function refreshSession() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      // Si 401, le refresh token n'existe pas ou a expiré
      if (response.status === 401) {
        throw new Error('Refresh token expired or missing');
      }
      throw new Error('Refresh failed');
    }

    return response.json();
  } catch (error) {
    // Ne pas logger les erreurs de refresh token manquant (normal si pas connecté)
    if (error instanceof Error && error.message.includes('Refresh token expired')) {
      throw error;
    }
    throw new Error('Refresh failed');
  }
}
```

### 4. Ajout d'autocomplete aux champs password
- **Login** : `autoComplete="current-password"`
- **Inscription** : `autoComplete="new-password"`

## Comment ça Fonctionne Maintenant

### En Développement
1. Le Web (port 3001) reçoit une requête vers `/api/auth/refresh`
2. Next.js proxy redirige vers `http://localhost:3000/api/auth/refresh`
3. Les cookies sont partagés car la requête passe par le même port (3001)
4. L'API répond avec les nouveaux tokens dans les cookies

### En Production
1. Le Web fait une requête directe vers l'URL de l'API (ex: `https://api.kibei.cd/api/auth/refresh`)
2. Les cookies fonctionnent car ils sont sur le même domaine (ou avec la bonne configuration CORS)

## Test

Pour vérifier que tout fonctionne :

1. **Redémarrer les serveurs de développement** :
   ```bash
   # Terminal 1 - API
   cd apps/api
   npm run dev

   # Terminal 2 - Web
   cd apps/web
   npm run dev
   ```

2. **Se connecter** :
   - Aller sur `http://localhost:3001/login`
   - Se connecter avec un compte de test
   - Vérifier qu'il n'y a plus d'erreur 401 dans la console

3. **Vérifier les cookies** :
   - Ouvrir les DevTools → Application → Cookies
   - Vérifier que `accessToken` et `refreshToken` sont présents
   - Les cookies doivent être sur `localhost:3001` (grâce au proxy)

## Notes Importantes

- ⚠️ Le proxy ne fonctionne qu'en **développement**
- ⚠️ En **production**, assurez-vous que `NEXT_PUBLIC_API_URL` pointe vers la bonne URL
- ⚠️ Les cookies doivent avoir `sameSite: 'lax'` et `credentials: 'include'` dans les requêtes

## Erreur d'Image (ERR_NAME_NOT_RESOLVED)

Si vous voyez encore une erreur d'image `IMG-20240725-WA0013.jpg`, cela signifie qu'une image est référencée avec une URL invalide. Vérifiez :
- Les chemins d'images dans le code
- Les images dans `apps/web/public/images/`
- Les références dans les composants

---

**Date** : Décembre 2024  
**Status** : ✅ Corrigé
