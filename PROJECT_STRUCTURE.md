# Arborescence — Plateforme PI / Assistance projets

```
patent/
├── .env.local.example
├── .env.example
├── .gitignore
├── .eslintrc.json
├── components.json                    # shadcn/ui
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── README.md
├── PROJECT_STRUCTURE.md
│
├── docs/
│   ├── SUPABASE_SETUP.md              # Config Auth, Storage, env, redirect URLs
│   ├── ARCHITECTURE.md                # Server/client, RLS, flux métier
│   ├── ROLES_AND_ROUTES.md            # Matrice rôle → routes
│   └── IA_INTEGRATION.md              # Placeholders IA, contrats futurs
│
├── supabase/
│   ├── config.toml
│   ├── seed.sql                       # Rôles, catégories, settings par défaut
│   └── migrations/
│       ├── 00001_extensions.sql
│       ├── 00002_enums_and_types.sql
│       ├── 00003_core_tables.sql      # profiles, roles, user_roles, settings
│       ├── 00004_projects.sql         # projects, members, updates, comments, tasks
│       ├── 00005_documents.sql        # documents, document_versions
│       ├── 00006_communication.sql    # messages, notifications
│       ├── 00007_ai.sql               # ai_searches, ai_results
│       ├── 00008_taxonomy.sql         # categories, tags, project_tags
│       ├── 00009_audit.sql            # audit_logs
│       ├── 00010_functions_triggers.sql
│       ├── 00011_rls_enable.sql
│       ├── 00012_rls_policies_profiles_roles.sql
│       ├── 00013_rls_policies_projects.sql
│       ├── 00014_rls_policies_documents.sql
│       ├── 00015_rls_policies_messages_notifications.sql
│       ├── 00016_rls_policies_ai_audit.sql
│       ├── 00017_storage_buckets.sql
│       ├── 00018_storage_policies.sql
│       └── 00019_grants.sql
│
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── images/
│       └── landing/
│
├── src/
│   ├── middleware.ts                  # Auth + redirection par rôle
│   │
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx                 # Root: providers, fonts, theme
│   │   ├── not-found.tsx
│   │   ├── error.tsx
│   │   ├── loading.tsx
│   │   │
│   │   ├── (public)/                  # Layout marketing, pas d'auth requise
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx               # / landing
│   │   │   ├── pricing/
│   │   │   │   └── page.tsx
│   │   │   ├── about/
│   │   │   │   └── page.tsx
│   │   │   └── contact/
│   │   │       └── page.tsx
│   │   │
│   │   ├── auth/
│   │   │   ├── layout.tsx             # Layout auth centré
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx
│   │   │   ├── reset-password/
│   │   │   │   └── page.tsx           # Callback reset
│   │   │   ├── callback/
│   │   │   │   └── route.ts           # OAuth / email confirm (si activé)
│   │   │   └── signout/
│   │   │       └── route.ts
│   │   │
│   │   ├── (dashboard)/               # Porteur + layout commun dashboard
│   │   │   ├── layout.tsx             # Sidebar + topbar
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx           # KPI, activité récente
│   │   │   │   ├── projects/
│   │   │   │   │   ├── page.tsx       # Liste + filtres + pagination
│   │   │   │   │   ├── new/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       ├── page.tsx   # Détail projet (tabs)
│   │   │   │   │       ├── documents/
│   │   │   │   │       │   └── page.tsx
│   │   │   │   │       ├── search/
│   │   │   │   │       │   └── page.tsx
│   │   │   │   │       └── loading.tsx
│   │   │   │   ├── search/
│   │   │   │   │   └── page.tsx       # Recherches IA globales
│   │   │   │   ├── documents/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── messages/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── tasks/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── notifications/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── profile/
│   │   │   │       └── page.tsx
│   │   │   └── onboarding/
│   │   │       └── role/
│   │   │           └── page.tsx       # Sélection rôle post-inscription
│   │   │
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── users/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── settings/
│   │   │   │   └── page.tsx
│   │   │   └── audit-logs/
│   │   │       └── page.tsx
│   │   │
│   │   ├── cpi/                       # Conseiller PI / avocat
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── cases/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   ├── review/
│   │   │   │   └── page.tsx
│   │   │   └── reports/
│   │   │       └── page.tsx
│   │   │
│   │   ├── expert/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── assigned-projects/
│   │   │   │   └── page.tsx
│   │   │   ├── analysis/
│   │   │   │   └── page.tsx
│   │   │   └── recommendations/
│   │   │       └── page.tsx
│   │   │
│   │   └── api/                       # Route handlers (webhooks, signed URLs, IA stubs)
│   │       ├── health/
│   │       │   └── route.ts
│   │       ├── documents/
│   │       │   ├── upload/
│   │       │   │   └── route.ts
│   │       │   ├── [id]/
│   │       │   │   ├── route.ts
│   │       │   │   └── signed-url/
│   │       │   │       └── route.ts
│   │       │   └── route.ts
│   │       ├── projects/
│   │       │   └── route.ts
│   │       ├── search/
│   │       │   └── global/
│   │       │       └── route.ts
│   │       └── ai/                    # Placeholders — pas d'appels LLM
│   │           ├── search/
│   │           │   └── route.ts
│   │           ├── summarize/
│   │           │   └── route.ts
│   │           ├── classify/
│   │           │   └── route.ts
│   │           ├── similarity/
│   │           │   └── route.ts
│   │           ├── tags/
│   │           │   └── route.ts
│   │           ├── assistant/
│   │           │   └── route.ts
│   │           └── report/
│   │               └── route.ts
│   │
│   ├── components/
│   │   ├── ui/                        # shadcn: button, card, dialog, table, etc.
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── select.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── table.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── tooltip.tsx
│   │   │   ├── sonner.tsx
│   │   │   ├── command.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── progress.tsx
│   │   │   └── theme-toggle.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── public-header.tsx
│   │   │   ├── public-footer.tsx
│   │   │   ├── dashboard-sidebar.tsx
│   │   │   ├── dashboard-topbar.tsx
│   │   │   ├── admin-sidebar.tsx
│   │   │   ├── cpi-sidebar.tsx
│   │   │   ├── expert-sidebar.tsx
│   │   │   ├── mobile-nav.tsx
│   │   │   └── breadcrumbs.tsx
│   │   │
│   │   ├── auth/
│   │   │   ├── login-form.tsx
│   │   │   ├── register-form.tsx
│   │   │   ├── forgot-password-form.tsx
│   │   │   └── auth-card.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── kpi-cards.tsx
│   │   │   ├── recent-activity.tsx
│   │   │   ├── project-card.tsx
│   │   │   ├── project-table.tsx
│   │   │   ├── project-filters.tsx
│   │   │   ├── project-status-badge.tsx
│   │   │   ├── project-timeline.tsx
│   │   │   ├── project-tabs.tsx
│   │   │   ├── comment-thread.tsx
│   │   │   ├── task-list.tsx
│   │   │   └── global-search.tsx
│   │   │
│   │   ├── documents/
│   │   │   ├── upload-zone.tsx
│   │   │   ├── document-list.tsx
│   │   │   ├── document-row.tsx
│   │   │   └── document-preview-drawer.tsx
│   │   │
│   │   ├── search/
│   │   │   ├── ai-search-form.tsx
│   │   │   ├── ai-results-panel.tsx
│   │   │   └── ai-search-status.tsx
│   │   │
│   │   ├── admin/
│   │   │   ├── users-table.tsx
│   │   │   ├── role-assignment-dialog.tsx
│   │   │   ├── settings-form.tsx
│   │   │   └── audit-log-table.tsx
│   │   │
│   │   ├── cpi/
│   │   │   ├── case-review-panel.tsx
│   │   │   ├── legal-comment-form.tsx
│   │   │   └── complement-request-form.tsx
│   │   │
│   │   ├── expert/
│   │   │   ├── technical-annotation-form.tsx
│   │   │   └── feasibility-score-card.tsx
│   │   │
│   │   └── shared/
│   │       ├── empty-state.tsx
│   │       ├── error-state.tsx
│   │       ├── loading-state.tsx
│   │       ├── page-header.tsx
│   │       ├── data-table.tsx
│   │       ├── pagination.tsx
│   │       ├── confirm-dialog.tsx
│   │       ├── status-badge.tsx
│   │       ├── role-badge.tsx
│   │       ├── user-menu.tsx
│   │       ├── notification-bell.tsx
│   │       └── providers.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts              # createBrowserClient
│   │   │   ├── server.ts              # createServerClient + cookies
│   │   │   ├── middleware.ts          # updateSession pour middleware
│   │   │   └── admin.ts               # Service role — UNIQUEMENT server, jamais client
│   │   │
│   │   ├── auth/
│   │   │   ├── get-user.ts
│   │   │   ├── require-user.ts
│   │   │   ├── require-role.ts
│   │   │   ├── redirect-by-role.ts
│   │   │   └── constants.ts           # Noms rôles, chemins home
│   │   │
│   │   ├── storage/
│   │   │   ├── buckets.ts
│   │   │   ├── upload.ts
│   │   │   ├── signed-url.ts
│   │   │   └── delete.ts
│   │   │
│   │   ├── db/
│   │   │   ├── queries/
│   │   │   │   ├── profiles.ts
│   │   │   │   ├── projects.ts
│   │   │   │   ├── documents.ts
│   │   │   │   ├── tasks.ts
│   │   │   │   ├── messages.ts
│   │   │   │   ├── notifications.ts
│   │   │   │   ├── ai-searches.ts
│   │   │   │   └── audit.ts
│   │   │   └── pagination.ts
│   │   │
│   │   ├── validations/
│   │   │   ├── auth.ts
│   │   │   ├── project.ts
│   │   │   ├── document.ts
│   │   │   ├── comment.ts
│   │   │   ├── task.ts
│   │   │   └── settings.ts
│   │   │
│   │   ├── actions/                   # Server Actions
│   │   │   ├── auth.ts
│   │   │   ├── profile.ts
│   │   │   ├── projects.ts
│   │   │   ├── documents.ts
│   │   │   ├── comments.ts
│   │   │   ├── tasks.ts
│   │   │   ├── ai-search.ts           # Crée enregistrement + stub status
│   │   │   └── admin.ts
│   │   │
│   │   ├── audit/
│   │   │   └── log-action.ts
│   │   │
│   │   ├── ai/                        # Contrats IA — pas d'implémentation LLM
│   │   │   ├── types.ts
│   │   │   ├── providers.ts           # Interface provider
│   │   │   └── stubs.ts
│   │   │
│   │   └── utils/
│   │       ├── cn.ts
│   │       ├── format.ts
│   │       ├── dates.ts
│   │       └── errors.ts
│   │
│   ├── hooks/
│   │   ├── use-user.ts
│   │   ├── use-profile.ts
│   │   ├── use-projects.ts
│   │   ├── use-documents.ts
│   │   ├── use-notifications.ts
│   │   ├── use-debounce.ts
│   │   └── use-media-query.ts
│   │
│   ├── stores/                        # Zustand — uniquement si nécessaire
│   │   └── ui-store.ts                # Sidebar collapse, préférences UI locales
│   │
│   ├── types/
│   │   ├── database.ts                # Généré: supabase gen types typescript
│   │   ├── supabase.ts                # Réexport / helpers Row types
│   │   ├── roles.ts
│   │   ├── project.ts
│   │   ├── document.ts
│   │   ├── ai.ts
│   │   └── api.ts
│   │
│   └── config/
│       ├── site.ts                    # Nom app, URLs, metadata
│       ├── navigation.ts              # Menus par rôle
│       └── constants.ts               # Statuts projet, MIME autorisés, limites upload
│
└── scripts/
    ├── generate-types.sh              # supabase gen types
    └── check-env.ts
```

## Conventions de nommage

| Zone | Convention |
|------|------------|
| Routes App Router | kebab-case dans les dossiers (`forgot-password`) |
| Composants React | PascalCase fichiers (`ProjectTable.tsx`) |
| Server Actions | `actions/*.ts`, fonctions exportées nommées |
| Queries DB | `lib/db/queries/*.ts`, une entité par fichier |
| Migrations SQL | ordre numérique, une responsabilité par fichier |
| Types métier | `src/types/*.ts` + `database.ts` généré Supabase |

## Groupes de routes (route groups)

- `(public)` — pas de préfixe URL, layout marketing
- `(dashboard)` — préfixe `/dashboard/*`, layout sidebar porteur
- `admin`, `cpi`, `expert` — layouts et sidebars dédiés par rôle

## Matrice rôle → home après login

| Rôle | Route home |
|------|------------|
| `project_holder` | `/dashboard` |
| `cpi_advisor` | `/cpi` |
| `expert` | `/expert` |
| `admin` | `/admin` |

## Buckets Storage Supabase

| Bucket | Visibilité | Usage |
|--------|------------|--------|
| `project-documents` | Privé + RLS | PDF, DOCX, images, CSV liés aux projets |
| `avatars` | Privé + RLS | Photos de profil |

## Couches sécurité

1. **Middleware** — session Supabase, routes publiques vs privées
2. **RLS PostgreSQL** — toutes les tables métier
3. **Storage policies** — accès fichier par `project_id` / membership
4. **Server** — `getUser()` / `requireRole()` avant mutations
5. **Client** — jamais de `SERVICE_ROLE_KEY`

## Prochaines étapes (ordre de génération)

1. ✅ Arborescence (ce document)
2. Schéma SQL + migrations + RLS + Storage
3. Bootstrap Next.js (package.json, configs, providers)
4. Clients Supabase + middleware + auth helpers
5. Composants UI partagés + layouts
6. Pages auth + onboarding rôle
7. Pages dashboard / admin / cpi / expert
8. `docs/SUPABASE_SETUP.md`
