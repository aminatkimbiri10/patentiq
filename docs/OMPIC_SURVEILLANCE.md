# Surveillance OMPIC, veille techno & commercialisation

## Migrations

Appliquer dans l’ordre (Supabase SQL Editor ou `npm run db:push`) :

1. `00025_surveillance_claims.sql` — watchlist, alertes, revendications
2. `00026_veille_commercialization.sql` — veille techno, fiche valorisation
3. `00028_watchlist_portfolio.sql` — logo, date enregistrement portefeuille

## OMPIC — pas d’API REST publique (couche n8n)

L’OMPIC ne publie pas d’API REST officielle. PatentIQ utilise un **provider configurable** ; la couche OMPIC est documentée pour **n8n** dans [N8N_OMPIC_SURVEILLANCE.md](./N8N_OMPIC_SURVEILLANCE.md) (Verdict I).

| Mode | Variable | Comportement |
|------|----------|--------------|
| `live` (défaut) | — | **Marques** : POST [search.ompic.ma](http://search.ompic.ma/web/pages/rechercheMarque.do) · **Brevets MA** : EPO OPS `pn=MA` |
| `stub` | — | Catalogue local de démo uniquement |
| `proxy` | `OMPIC_PROXY_URL` | Webhook n8n ou autre proxy |
| `hybrid` | `OMPIC_PROXY_URL` | live/proxy puis stub si échec |

### Contrat proxy attendu (n8n webhook)

Voir le guide complet : [N8N_OMPIC_SURVEILLANCE.md](./N8N_OMPIC_SURVEILLANCE.md)  
Workflow stub importable : `docs/n8n/ompic-proxy-stub-workflow.json`

```http
POST {OMPIC_PROXY_URL}
Authorization: Bearer {OMPIC_PROXY_TOKEN}
Content-Type: application/json
```

{
  "query": "Coca-Cola",
  "asset_type": "trademark",
  "territory": "MA",
  "registration_number": "MA-M-2019-004521",
  "nice_classes": "32"
}
```

Réponse :

```json
{
  "results": [{
    "title": "…",
    "ref": "MA-…",
    "source": "ompic",
    "summary": "…",
    "score": 0.82,
    "publication_end_at": "2026-08-15",
    "opposition_eligible": true
  }]
}
```

## Similarité visuelle des logos (marques)

Si l'actif watchlist **marque** a une `logo_url` (PNG/JPG/SVG public), PatentIQ compare les images via **average hash (aHash)** — voir `src/lib/surveillance/logo-similarity.ts`.

| Élément | Détail |
|---------|--------|
| Score combiné | 55 % texte + 45 % visuel |
| Seuil visuel seul | ≥ 72 % |
| OMPIC live | Pas d'URL logo dans le HTML — passer par **proxy n8n** (`logo_url` par résultat) ou mode **stub** |
| Alertes | `metadata.logo_score`, `match_kind: text_and_logo` |

**Démo stub :** marque « Coca-Cola » + logo Wikipedia → alerte « Coca-Kola ».

**Dessins & modèles :** pas de recherche automatisée dans PatentIQ (l'OMPIC ne publie pas d'API publique). Le **cycle dossier** (dépôt → enregistrement → surveillance manuelle) reste disponible dans le parcours PI ; antériorités via [ompic.ma](https://www.ompic.ma) et [directompic.ma](https://directompic.ma).

Portails publics utiles : [ompic.ma](https://www.ompic.ma), [patent.ompic.ma](https://patent.ompic.ma), [directompic.ma](https://directompic.ma).

## Veille technologique (cron hebdo)

- UI : `/dashboard/surveillance` et `/cpi/surveillance`
- Worker : `POST /api/surveillance/worker` (watchlist + veille + **rappels échéances PI**)
- GitHub Actions : `.github/workflows/surveillance-scan.yml` (lundis 06:00 UTC)
- Recherche : EPO OPS si `EPO_OPS_CONSUMER_KEY` / `SECRET` configurés

## Commercialisation

Onglet **Valorisation** visible quand le dossier est `approved` ou `closed` (porteur + CPI).

## Sécurité

- Confirmation email obligatoire (middleware → `/auth/check-email`)
- 2FA TOTP : `/dashboard/security` (recommandé CPI)

## Échéances PI (rappels)

- **Marque** : fin opposition 2 mois après publication (cycle marque → statut « Publié »)
- **Brevet** : publication ~18 mois après dépôt (cycle brevet → statut « Déposé »)
- Widget sur `/dashboard` et `/cpi` si échéance ≤ 30 jours
- Notifications automatiques via le worker hebdo (porteur + CPI assigné)
