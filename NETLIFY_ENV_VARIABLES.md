# 🔐 Guide de Configuration des Variables d'Environnement Netlify

Ce guide vous explique **étape par étape** comment configurer toutes les variables d'environnement nécessaires pour votre application KiBei sur Netlify.

## 📋 Table des matières

1. [Variables requises](#variables-requises)
2. [Comment les configurer sur Netlify](#configuration-sur-netlify)
3. [D'où obtenir les valeurs](#obtenir-les-valeurs)
4. [Exemple complet](#exemple-complet)
5. [Vérification](#vérification)

---

## ✅ Variables requises

Voici toutes les variables d'environnement que vous devez configurer dans Netlify :

### 🔴 Variables OBLIGATOIRES

| Variable | Description | Exemple |
|----------|-------------|---------|
| `SUPABASE_URL` | URL de votre projet Supabase | `https://xxxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Clé publique Supabase | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé privée Supabase (⚠️ confidentielle) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `DATABASE_URL` | URL de connexion PostgreSQL | `postgresql://postgres:[password]@db.xxxxx.supabase.co:5432/postgres` |
| `JWT_SECRET` | Clé secrète pour JWT (min 32 caractères) | `votre-cle-secrete-min-32-caracteres` |
| `NEXT_PUBLIC_API_URL` | URL de votre API en production | `https://votre-api.com` ou `https://votre-api.netlify.app` |
| `NEXT_PUBLIC_WEB_URL` | URL de votre site Netlify | `https://votre-site.netlify.app` |
| `NODE_ENV` | Environnement d'exécution | `production` |

### 🟡 Variables OPTIONNELLES (avec valeurs par défaut)

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `JWT_EXPIRY` | Durée de vie du token JWT (secondes) | `900` (15 minutes) |
| `JWT_REFRESH_EXPIRY` | Durée de vie du refresh token (secondes) | `604800` (7 jours) |

---

## 🔧 Configuration sur Netlify

### Étape 1: Accéder aux variables d'environnement

1. Connectez-vous à [app.netlify.com](https://app.netlify.com)
2. Sélectionnez votre site (ou créez-le d'abord)
3. Allez dans **Site settings** (Paramètres du site)
4. Dans le menu de gauche, cliquez sur **Environment variables** (Variables d'environnement)

### Étape 2: Ajouter les variables

Pour chaque variable :

1. Cliquez sur **Add a variable** (Ajouter une variable)
2. Entrez le **nom** de la variable (exactement comme indiqué ci-dessus)
3. Entrez la **valeur** de la variable
4. Choisissez le **scope** :
   - **All scopes** : Pour tous les environnements (production, preview, branch deploys)
   - **Production** : Uniquement pour la production
   - **Specific branches** : Pour certaines branches spécifiques
5. Cliquez sur **Save** (Enregistrer)

**💡 Astuce :** Pour les variables sensibles (`SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `DATABASE_URL`), utilisez **Production** uniquement.

### Étape 3: Répéter pour toutes les variables

Ajoutez toutes les variables de la liste ci-dessus, une par une.

---

## 🔍 Obtenir les valeurs

### 1. Variables Supabase

#### SUPABASE_URL et SUPABASE_ANON_KEY

1. Connectez-vous à [supabase.com](https://supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Settings** (Paramètres) → **API**
4. Vous trouverez :
   - **Project URL** → C'est votre `SUPABASE_URL`
   - **anon public** key → C'est votre `SUPABASE_ANON_KEY`

#### SUPABASE_SERVICE_ROLE_KEY

1. Dans la même page **Settings** → **API**
2. Trouvez **service_role secret** key
3. **⚠️ ATTENTION :** Cette clé a accès complet à votre base de données !
4. Ne la partagez JAMAIS publiquement
5. Utilisez uniquement côté serveur

#### DATABASE_URL

1. Allez dans **Settings** → **Database**
2. Dans la section **Connection string**, choisissez **URI**
3. Copiez la chaîne de connexion
4. Remplacez `[YOUR-PASSWORD]` par votre mot de passe de base de données
5. Format : `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres`

**Exemple :**
```
postgresql://postgres:MonMotDePasse123@db.abcdefghijklmnop.supabase.co:5432/postgres
```

### 2. Variables JWT

#### JWT_SECRET

Cette clé doit être :
- **Minimum 32 caractères**
- **Aléatoire et sécurisée**
- **Unique** (ne réutilisez pas celle du développement)

**Génération d'une clé sécurisée :**

**Option A : Utiliser Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option B : Utiliser OpenSSL**
```bash
openssl rand -hex 32
```

**Option C : Utiliser un générateur en ligne**
- [randomkeygen.com](https://randomkeygen.com/)
- Choisissez "CodeIgniter Encryption Keys"

**Exemple de clé générée :**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

#### JWT_EXPIRY et JWT_REFRESH_EXPIRY

Ces valeurs sont en **secondes** :

- `JWT_EXPIRY=900` → 15 minutes (déjà bon par défaut)
- `JWT_REFRESH_EXPIRY=604800` → 7 jours (déjà bon par défaut)

Vous pouvez les laisser avec les valeurs par défaut ou les personnaliser.

### 3. Variables NEXT_PUBLIC_*

#### NEXT_PUBLIC_WEB_URL

C'est l'URL de votre site Netlify :

1. Après le premier déploiement Netlify, vous obtiendrez une URL
2. Format : `https://votre-site.netlify.app`
3. Si vous avez un domaine personnalisé : `https://votre-domaine.com`

**💡 Note :** Netlify génère automatiquement une URL après le premier déploiement.

#### NEXT_PUBLIC_API_URL

C'est l'URL de votre API backend :

- Si votre API est sur Netlify aussi : `https://votre-api.netlify.app`
- Si votre API est ailleurs : `https://votre-api.com`
- Pour le développement : `http://localhost:3000`

**⚠️ Important :** Si vous n'avez pas encore d'API en production, vous pouvez utiliser une URL temporaire, mais l'application ne fonctionnera pas complètement sans API.

#### NODE_ENV

Toujours mettre : `production`

---

## 📝 Exemple complet

Voici un exemple complet de toutes les variables configurées dans Netlify :

```
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0Njg3NjUyMCwiZXhwIjoxOTYyNDUyNTIwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjQ2ODc2NTIwLCJleHAiOjE5NjI0NTI1MjB9.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
DATABASE_URL=postgresql://postgres:MonMotDePasseSecret123@db.abcdefghijklmnop.supabase.co:5432/postgres
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
JWT_EXPIRY=900
JWT_REFRESH_EXPIRY=604800
NEXT_PUBLIC_API_URL=https://kibei-api.netlify.app
NEXT_PUBLIC_WEB_URL=https://kibei-mobile-rdc.netlify.app
NODE_ENV=production
```

**⚠️ NE COPIEZ PAS ces exemples !** Utilisez vos propres valeurs.

---

## ✅ Vérification

### Après avoir ajouté toutes les variables

1. **Redéployez votre site** dans Netlify :
   - Allez dans **Deploys** (Déploiements)
   - Cliquez sur les **3 points** (⋮) sur le dernier déploiement
   - Cliquez sur **Trigger deploy** → **Deploy site**

2. **Vérifiez les logs de build** :
   - Allez dans **Deploys**
   - Cliquez sur le déploiement
   - Vérifiez qu'il n'y a pas d'erreurs liées aux variables d'environnement

3. **Testez votre application** :
   - Ouvrez votre site Netlify
   - Vérifiez que l'application se charge
   - Testez la connexion (si applicable)
   - Vérifiez que les données se chargent depuis Supabase

### Erreurs communes

#### ❌ "Environment variable not found"

**Solution :** Vérifiez que :
- Le nom de la variable est exact (sensible à la casse)
- Vous avez redéployé après avoir ajouté la variable
- La variable est dans le bon scope (Production, Preview, etc.)

#### ❌ "Invalid database connection"

**Solution :** Vérifiez que :
- `DATABASE_URL` est correctement formatée
- Le mot de passe ne contient pas de caractères spéciaux non échappés
- La base de données est accessible depuis Internet (Supabase le permet par défaut)

#### ❌ "JWT secret too short"

**Solution :** Vérifiez que `JWT_SECRET` fait au moins 32 caractères.

#### ❌ "Supabase connection failed"

**Solution :** Vérifiez que :
- `SUPABASE_URL` est correcte (sans slash à la fin)
- `SUPABASE_ANON_KEY` est la clé "anon public" et non "service_role"
- Les clés sont complètes (généralement très longues)

---

## 🔒 Sécurité

### ⚠️ Variables sensibles

Ces variables sont **confidentielles** et ne doivent JAMAIS être :
- Commitées dans Git
- Partagées publiquement
- Exposées côté client

Variables sensibles :
- ✅ `SUPABASE_SERVICE_ROLE_KEY` (très sensible !)
- ✅ `DATABASE_URL` (contient le mot de passe)
- ✅ `JWT_SECRET` (clé de signature)

### ✅ Bonnes pratiques

1. **Utilisez des clés différentes** pour développement et production
2. **Régénérez les clés** si elles sont compromises
3. **Limitez l'accès** aux variables dans Netlify
4. **Utilisez les scopes** pour limiter où les variables sont disponibles
5. **Ne partagez jamais** les valeurs par email, chat, etc.

---

## 📚 Ressources supplémentaires

- [Documentation Netlify - Environment Variables](https://docs.netlify.com/environment-variables/overview/)
- [Documentation Supabase - API Keys](https://supabase.com/docs/guides/api)
- [Documentation JWT](https://jwt.io/introduction)

---

## 🆘 Besoin d'aide ?

Si vous rencontrez des problèmes :

1. Vérifiez les logs de build dans Netlify
2. Vérifiez que toutes les variables sont présentes
3. Vérifiez que les valeurs sont correctes (sans espaces, caractères spéciaux, etc.)
4. Redéployez après chaque modification de variable

---

**Dernière mise à jour :** Décembre 2024
