# Configuration Supabase

Guide pour déployer le schéma, RLS et Storage de la plateforme PI.

## Prérequis

- [Supabase CLI](https://supabase.com/docs/guides/cli) installé
- Projet Supabase (cloud ou local)
- Node.js 18+ (pour l’app Next.js, étape suivante)

## 1. Créer le projet Supabase

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Noter :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (**serveur uniquement**, jamais dans le client)

## 2. Variables d’environnement

Créer `.env.local` à la racine :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 3. Appliquer les migrations

> Inclure `00021` … `00023_workflow_auto_assign_cpi.sql` (assignation CPI + notifications à la soumission).

**Correctif rapide (SQL Editor)** — coller et exécuter le contenu de `supabase/migrations/00022_fix_project_creation.sql` si `supabase db push` n’est pas possible.

### Option A — CLI (recommandé)

```bash
cd patent
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

### Option B — SQL Editor (dashboard)

Exécuter dans l’ordre les fichiers `supabase/migrations/00001_*.sql` … `00019_*.sql`, puis `supabase/seed.sql`.

### Option C — Développement local

```bash
supabase start
supabase db reset   # migrations + seed si configuré dans config.toml
```

Ajouter dans `supabase/config.toml` :

```toml
[db.seed]
enabled = true
sql_paths = ["./seed.sql"]
```

## 4. Auth — URLs de redirection

Dashboard → **Authentication** → **URL Configuration** :

| Champ | Valeur (dev) |
|-------|----------------|
| Site URL | `http://localhost:3000` |
| Redirect URLs | `http://localhost:3000/auth/callback`, `http://localhost:3000/auth/reset-password` |

Activer **Email** provider.

### Connexion sociale (Google & GitHub)

Dashboard → **Authentication** → **Providers** :

| Provider | Configuration |
|----------|----------------|
| **Google** | Activer, renseigner Client ID / Secret (Google Cloud Console). Redirect URI : `https://<ref>.supabase.co/auth/v1/callback` |
| **GitHub** | Activer, créer une OAuth App GitHub. Authorization callback : `https://<ref>.supabase.co/auth/v1/callback` |

Les boutons Google / GitHub sur `/auth/login` et `/auth/register` redirigent vers `/auth/callback?next=/onboarding/role`.

### ⚠️ « Email not confirmed » / aucun email reçu

Sur **Supabase Cloud**, la confirmation d’email est souvent **activée par défaut**. Tant que l’email n’est pas confirmé :

- la **connexion** renvoie `Email not confirmed` ;
- **aucune session** n’est créée à l’inscription (comportement normal) ;
- les emails partent via le SMTP Supabase (limité) — souvent **aucun mail** en dev sans configuration.

**Solution recommandée en développement** (dashboard cloud) :

1. **Authentication** → **Providers** → **Email**
2. Désactiver **「Confirm email」** / **「Enable email confirmations」**
3. Enregistrer

Vous pourrez vous connecter immédiatement après inscription. Réactivez la confirmation en production avec un **SMTP custom** (Resend, SendGrid, etc.) : **Project Settings** → **Authentication** → **SMTP Settings**.

**Si vous gardez la confirmation activée** :

- Après inscription, l’app affiche « Vérifiez votre email » (pas de redirection onboarding).
- Lien de confirmation → `http://localhost:3000/auth/callback?next=/onboarding/role`
- Renvoyer le mail : `/auth/check-email`
- Vérifier **Redirect URLs** inclut bien `/auth/callback`

**Profil vide dans `profiles`** :

1. Appliquer toutes les migrations (`supabase db push`), dont `00010` (trigger) et `00020` (upsert).
2. L’app appelle aussi `ensureProfile` (service role) à l’inscription — nécessite `SUPABASE_SERVICE_ROLE_KEY` dans `.env.local`.

### Trigger profil

Le trigger `on_auth_user_created` crée automatiquement une ligne dans `profiles` à chaque inscription (`auth.users`).

## 5. Storage

Les buckets sont créés par `00017_storage_buckets.sql` :

| Bucket | Privé | Limite | MIME |
|--------|-------|--------|------|
| `project-documents` | Oui | 50 Mo | pdf, docx, doc, png, jpg, csv |
| `avatars` | Oui | 5 Mo | png, jpg, webp |

### Convention de chemins

```
project-documents/{project_id}/{user_id}/{filename}
avatars/{user_id}/avatar.png
```

Les policies Storage (`00018`) s’alignent sur les helpers `can_view_project` / `can_upload_to_project`.

### Upload depuis l’app

1. Créer l’enregistrement `documents` (status `uploading`) via Server Action
2. Upload fichier vers Storage avec le chemin ci-dessus
3. Mettre à jour `documents.file_path`, `status = active`
4. Téléchargement : URL signée via `supabase.storage.createSignedUrl()` côté serveur

## 6. Premier administrateur

Après inscription d’un compte admin :

```sql
-- Remplacer <USER_UUID> par l'id auth.users
INSERT INTO public.user_roles (user_id, role_id, is_primary)
SELECT '<USER_UUID>', r.id, TRUE
FROM public.roles r
WHERE r.role_name = 'admin'
ON CONFLICT (user_id, role_id) DO UPDATE SET is_primary = TRUE;

UPDATE public.profiles
SET onboarding_completed = TRUE
WHERE id = '<USER_UUID>';
```

## 7. Générer les types TypeScript

```bash
supabase gen types typescript --project-id <ref> > src/types/database.ts
```

## 8. Vérifications post-déploiement

```sql
-- RLS actif
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Rôles seed
SELECT * FROM public.roles;

-- Buckets
SELECT id, public, file_size_limit FROM storage.buckets;
```

## 9. Sécurité — rappels

- Ne jamais exposer `SUPABASE_SERVICE_ROLE_KEY` au navigateur
- Toutes les tables métier ont RLS + FORCE sur tables sensibles
- Les workers IA futurs utilisent `service_role` pour écrire `ai_results` (bypass RLS)
- Journaliser les actions sensibles via `public.write_audit_log(...)`

## 10. Matrice d’accès (résumé)

| Ressource | Porteur | CPI | Expert | Admin |
|-----------|---------|-----|--------|-------|
| Ses projets | CRUD | Assignés | Assignés | Tous |
| Documents projet | Upload si membre | Oui si assigné | Oui si assigné | Tous |
| Commentaires internes | Non | Oui | Oui | Oui |
| `audit_logs` | Ses actions | Projet assigné | — | Tous |
| `settings` | Publics | Publics | Publics | Tous |
| Storage | Membre projet | Membre / assigné | Membre / assigné | Tous |

## Fichiers migrations

| Fichier | Contenu |
|---------|---------|
| 00001 | Extensions, schéma `app` |
| 00002 | Enums |
| 00003 | profiles, roles, user_roles, settings |
| 00004 | projects, members, updates, comments, tasks |
| 00005 | documents, document_versions |
| 00006 | messages, notifications |
| 00007 | ai_searches, ai_results |
| 00008 | categories, tags, project_tags |
| 00009 | audit_logs |
| 00010 | Triggers, helpers RLS |
| 00011 | ENABLE RLS |
| 00012–00016 | Policies par domaine |
| 00017–00018 | Buckets + Storage policies |
| 00019 | GRANTs |
