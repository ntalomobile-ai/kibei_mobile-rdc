# KiBei Contributing Guide

Merci de votre intérêt pour contribuer à KiBei! Ce guide vous aidera à comprendre comment participer au projet.

## 🎯 Code of Conduct

- Respectez la diversité
- Communicez clairement
- Restez professionnel
- Aidez les autres développeurs

## 🏗️ Architecture à Respecter

### Principes
1. **Clean Architecture** - Séparation des couches
2. **DDD** - Domain-Driven Design
3. **SOLID** - Principes SOLID
4. **Security First** - Sécurité en priorité

### Structure
```
Presentation → Application → Domain → Data Access → Database
```

## 📋 Avant de Contribuer

### Setup Local
```bash
# 1. Fork le repository
# 2. Clone votre fork
git clone https://github.com/YOUR_USERNAME/kibei.git
cd kibei

# 3. Ajouter upstream
git remote add upstream https://github.com/kibei/mobile-rdc.git

# 4. Install & setup
npm install
npm run db:push --workspace=@kibei/db
npm run db:seed --workspace=@kibei/db
```

## 🌿 Workflow Git

### 1. Créer une branche
```bash
# Toujours partir de main à jour
git checkout main
git pull upstream main

# Créer votre branche
git checkout -b feature/your-feature-name
# ou
git checkout -b fix/your-bug-name
```

### 2. Commits
```bash
# Commits clairs et atomiques
git commit -m "feat: add price submission endpoint"

# Format: type(scope): message
# Types: feat, fix, docs, style, refactor, test, chore
```

### 3. Push & Pull Request
```bash
git push origin feature/your-feature-name

# Créer PR sur GitHub
# - Titre descriptif
# - Description détaillée
# - Lier l'issue (#123)
# - Auto-close si applicable (Closes #123)
```

## ✅ Checklist Avant PR

- [ ] Code testé localement
- [ ] Types TypeScript corrects
- [ ] Linting passant (`npm run lint`)
- [ ] Tests passant (si applicable)
- [ ] Build réussi (`npm run build`)
- [ ] Documentation mise à jour
- [ ] Variables de test nettoyées
- [ ] Pas de console.log en production

## 📝 Style Guide

### TypeScript Strict Mode
```typescript
// ✅ BON
function processPrice(price: number, productId: string): Promise<Price> {
  if (price <= 0) {
    throw new Error('Price must be positive');
  }
  return submitPrice(productId, price);
}

// ❌ MAUVAIS
function processPrice(price: any, productId: any): any {
  return submitPrice(productId, price);
}
```

### Nommage
```typescript
// Classes
class PriceService { }
class ExchangeRateValidator { }

// Fonctions
function validatePrice() { }
function getApprovedPrices() { }

// Constants
const MAX_PRICE = 1000000;
const SUBMISSION_TIMEOUT = 30000;

// Variables
const isValid = true;
const userRole = 'collector';
```

### Formatting
```typescript
// Import order
import { external } from 'package';
import type { Type } from 'type-package';
import { local } from '@kibei/package';
import { file } from './file';

// Spacing
function example() {
  const x = 1;

  if (x > 0) {
    return true;
  }

  return false;
}
```

## 🧪 Testing

### Unit Tests
```typescript
describe('PriceService', () => {
  it('should reject negative prices', () => {
    expect(() => {
      validatePrice(-100);
    }).toThrow();
  });

  it('should format price correctly', () => {
    const formatted = formatPrice(450, 'CDF');
    expect(formatted).toBe('450,00 CDF');
  });
});
```

### Integration Tests
```typescript
describe('POST /api/collector/prices', () => {
  it('should require authentication', async () => {
    const response = await fetch('/api/collector/prices', {
      method: 'POST',
      body: JSON.stringify({ /* ... */ })
    });
    expect(response.status).toBe(401);
  });

  it('should create price submission', async () => {
    const response = await authenticatedFetch('/api/collector/prices', {
      method: 'POST',
      body: JSON.stringify({
        productId: 'uuid',
        marketId: 'uuid',
        price: 450
      })
    });
    expect(response.status).toBe(201);
    expect(response.data.status).toBe('pending');
  });
});
```

## 🔍 Code Review Expectations

Les reviewers vérifieront:

1. **Correctness** - Le code fonctionne-t-il correctement?
2. **Style** - Suit-il les conventions?
3. **Security** - Y a-t-il des failles?
4. **Performance** - Est-ce optimisé?
5. **Testing** - Y a-t-il des tests?
6. **Documentation** - Est-ce documenté?

## 🚀 Merging Policy

- Minimum 1 approval requis
- Tous les tests doivent passer
- Pas de conflits avec main
- Code review complètée
- CI/CD validation réussie

## 📦 Releasing

### Version Bump
```bash
# MAJOR.MINOR.PATCH
# 0.1.0 → breaking changes
# 0.1.1 → new features
# 0.1.1 → bug fixes
```

### Release Checklist
- [ ] CHANGELOG.md mis à jour
- [ ] Version bumped dans package.json
- [ ] Tag créé (v0.1.0)
- [ ] Release notes écrites
- [ ] Déploiement en staging
- [ ] Tests en staging OK
- [ ] Déploiement en production

## 🐛 Rapporter les Bugs

### Template
```markdown
## Description
Brève description du bug

## Reproduction Steps
1. Aller à...
2. Cliquer sur...
3. Observer...

## Expected
Comportement attendu

## Actual
Comportement réel

## Screenshots/Logs
```

## 💡 Suggérer des Features

### Template
```markdown
## Description
Quelle feature voulez-vous?

## Motivation
Pourquoi est-ce important?

## Possible Implementation
Comment l'implémenter?
```

## 🔒 Security

### Reporting Security Issues
❌ **Ne pas:** créer d'issue publique  
✅ **Faire:** email à security@kibei.cd

## 📚 Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Guide](https://www.prisma.io/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🎓 Learning Paths

### Pour Débuter
1. Lire README.md
2. Examiner les issues "good first issue"
3. Implémenter une petite feature
4. Participer aux reviews

### Pour Approfondir
1. Étudier ARCHITECTURE.md
2. Contribuer à l'API
3. Optimiser les performances
4. Améliorer la sécurité

## 🤝 Mentorship

Nous aimerions mentorer les nouveaux contributeurs!

- Posez des questions dans les PRs
- Demandez du feedback
- Participez aux discussions
- Aidez les autres

## 📞 Contacts

- **Questions:** GitHub Discussions
- **Chat:** Discord (TBD)
- **Email:** dev@kibei.cd
- **Issues:** GitHub Issues

---

**Merci de contribuer à KiBei! 🙏**

Version: 0.1.0  
Last Updated: December 22, 2024
