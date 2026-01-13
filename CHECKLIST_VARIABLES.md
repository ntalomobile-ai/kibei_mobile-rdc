# ✅ Checklist - Variables d'Environnement Netlify

Checklist rapide pour configurer les variables d'environnement sur Netlify.

## 📝 Variables à configurer

### Variables Supabase

- [ ] `SUPABASE_URL`
  - Où : Supabase → Settings → API → Project URL
  - Exemple : `https://xxxxx.supabase.co`

- [ ] `SUPABASE_ANON_KEY`
  - Où : Supabase → Settings → API → anon public key
  - Format : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

- [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - Où : Supabase → Settings → API → service_role secret key
  - ⚠️ Très sensible ! Ne jamais partager
  - Format : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

- [ ] `DATABASE_URL`
  - Où : Supabase → Settings → Database → Connection string → URI
  - Format : `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres`
  - ⚠️ Remplacez `[PASSWORD]` par votre mot de passe DB

### Variables JWT

- [ ] `JWT_SECRET`
  - Générer avec : `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
  - ⚠️ Minimum 32 caractères
  - ⚠️ Différent de celui du développement

- [ ] `JWT_EXPIRY` (optionnel)
  - Valeur par défaut : `900` (15 minutes)

- [ ] `JWT_REFRESH_EXPIRY` (optionnel)
  - Valeur par défaut : `604800` (7 jours)

### Variables Application

- [ ] `NEXT_PUBLIC_WEB_URL`
  - URL de votre site Netlify
  - Format : `https://votre-site.netlify.app`
  - 💡 Disponible après le premier déploiement

- [ ] `NEXT_PUBLIC_API_URL`
  - URL de votre API backend
  - Format : `https://votre-api.com` ou `https://votre-api.netlify.app`

- [ ] `NODE_ENV`
  - Valeur : `production`

## 🔧 Étapes de configuration

1. [ ] Connectez-vous à [app.netlify.com](https://app.netlify.com)
2. [ ] Sélectionnez votre site
3. [ ] Allez dans **Site settings** → **Environment variables**
4. [ ] Ajoutez chaque variable une par une
5. [ ] Choisissez le scope approprié (Production pour les variables sensibles)
6. [ ] Redéployez votre site après avoir ajouté toutes les variables

## ✅ Vérification

- [ ] Toutes les variables sont ajoutées
- [ ] Le build Netlify réussit
- [ ] L'application se charge correctement
- [ ] La connexion à Supabase fonctionne
- [ ] Les données se chargent depuis la base de données

## 📚 Documentation complète

Pour plus de détails, consultez : **[NETLIFY_ENV_VARIABLES.md](./NETLIFY_ENV_VARIABLES.md)**

---

**💡 Astuce :** Gardez cette checklist ouverte pendant la configuration pour cocher chaque variable au fur et à mesure !
