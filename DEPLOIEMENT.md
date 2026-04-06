# ComptaAI — Guide de déploiement complet

## Stack
- **Frontend/Backend** : Next.js 14 (App Router, TypeScript)
- **Base de données + Auth** : Supabase
- **Paiements** : Stripe
- **IA** : Claude API (claude-sonnet-4-6)
- **Hébergement** : Vercel

---

## Étape 1 — Supabase

### 1.1 Créer le projet
1. Aller sur [supabase.com](https://supabase.com)
2. "New project" → nom : `comptaai` → choisir région Europe (Frankfurt)
3. Noter le mot de passe de la base de données

### 1.2 Exécuter le schéma SQL
1. Dashboard Supabase → "SQL Editor"
2. Coller tout le contenu de `supabase_schema.sql`
3. Cliquer "Run"

### 1.3 Configurer l'Auth
1. Dashboard → Authentication → URL Configuration
2. **Site URL** : `https://ton-domaine.vercel.app`
3. **Redirect URLs** : ajouter `https://ton-domaine.vercel.app/auth/callback`

### 1.4 Récupérer les clés API
- Dashboard → Settings → API
- Copier `URL`, `anon key`, `service_role key`

---

## Étape 2 — Stripe

### 2.1 Créer le compte
1. Aller sur [stripe.com](https://stripe.com)
2. Activer les paiements (ajouter IBAN pour les virements)

### 2.2 Créer les 3 produits
Stripe Dashboard → Products → "Add product" × 3 :

| Produit | Prix | Intervalle |
|---------|------|------------|
| ComptaAI Solo | 29,00 € | Mensuel |
| ComptaAI Pro | 79,00 € | Mensuel |
| ComptaAI Expert | 199,00 € | Mensuel |

Après création, noter les **Price IDs** (format `price_xxx`) pour chaque plan.

### 2.3 Configurer le webhook
1. Stripe Dashboard → Developers → Webhooks → "Add endpoint"
2. **URL** : `https://ton-domaine.vercel.app/api/stripe/webhook`
3. **Événements à écouter** :
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copier le **Signing secret** (`whsec_xxx`)

---

## Étape 3 — Claude API

1. Aller sur [console.anthropic.com](https://console.anthropic.com)
2. API Keys → "Create Key"
3. Copier la clé (`sk-ant-xxx`)

---

## Étape 4 — Déploiement Vercel

### 4.1 Installer Vercel CLI
```bash
npm i -g vercel
```

### 4.2 Déployer
```bash
cd ~/comptaai
vercel
```
Répondre aux questions :
- Project name : `comptaai`
- Framework : Next.js (détecté automatiquement)

### 4.3 Ajouter les variables d'environnement
Dans le dashboard Vercel → Settings → Environment Variables, ajouter **toutes** les variables du `.env.example` remplies.

Ou via CLI :
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add STRIPE_SECRET_KEY
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
vercel env add STRIPE_WEBHOOK_SECRET
vercel env add STRIPE_PRICE_SOLO
vercel env add STRIPE_PRICE_PRO
vercel env add STRIPE_PRICE_EXPERT
vercel env add ANTHROPIC_API_KEY
vercel env add NEXT_PUBLIC_APP_URL
```

### 4.4 Redéployer après avoir ajouté les variables
```bash
vercel --prod
```

---

## Étape 5 — Vérifications post-déploiement

### Checklist fonctionnelle
- [ ] Landing page accessible
- [ ] Inscription fonctionnelle (email de confirmation reçu)
- [ ] Login et redirection dashboard
- [ ] Ajout d'une société
- [ ] Upload d'un document (test avec une facture PDF)
- [ ] Analyse IA du document
- [ ] Chat avec l'agent comptable
- [ ] Checkout Stripe (utiliser carte test `4242 4242 4242 4242`)
- [ ] Webhook Stripe reçu (vérifier dans Stripe Dashboard → Webhooks → Recent events)
- [ ] Abonnement visible dans Paramètres
- [ ] Export CSV fonctionnel (`/api/export`)
- [ ] Déclaration TVA visible
- [ ] Génération rapport mensuel

### Tester le webhook Stripe en local
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## Structure des pages

```
/                         → Landing page + pricing
/auth/login               → Connexion
/auth/register            → Inscription
/dashboard                → Tableau de bord (KPIs + graphiques)
/dashboard/companies      → Gestion des sociétés
/dashboard/documents      → Upload + analyse IA
/dashboard/transactions   → Toutes les transactions + saisie manuelle
/dashboard/tva            → Simulateur déclaration CA3
/dashboard/chat           → Agent comptable IA
/dashboard/reports        → Rapport mensuel automatique
/dashboard/settings       → Profil + abonnement Stripe

/api/agent                → POST — chat IA
/api/documents/analyze    → POST — analyse document
/api/reports              → POST — génération rapport
/api/export               → GET  — export CSV transactions
/api/stripe/checkout      → POST — créer session paiement
/api/stripe/portal        → POST — portail client Stripe
/api/stripe/webhook       → POST — événements Stripe
```

---

## Plans tarifaires

| Plan | Prix/mois | Sociétés | Documents |
|------|-----------|----------|-----------|
| Solo | 29 € | 1 | 100/mois |
| Pro | 79 € | 3 | Illimité |
| Expert | 199 € | 10 | Illimité + suivi humain |

---

## Notes importantes

- **RLS Supabase** : chaque utilisateur ne voit que ses propres données
- **Webhook Stripe** : doit être vérifié avec le `STRIPE_WEBHOOK_SECRET` sinon il retournera 400
- **BOM CSV** : l'export inclut un BOM UTF-8 pour la compatibilité Excel français
- **TVA** : les calculs sont indicatifs, toujours faire valider par un expert-comptable
