-- Portefeuille client : logo + date d'enregistrement (surveillance Phase 2 — Verdict I)

ALTER TABLE public.ip_watchlist
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS registered_at DATE;

COMMENT ON COLUMN public.ip_watchlist.logo_url IS 'URL ou chemin du logo marque (actif déjà protégé)';
COMMENT ON COLUMN public.ip_watchlist.registered_at IS 'Date d''enregistrement OMPIC de l''actif';

-- Métadonnées alertes : fenêtre opposition marque (publication OMPIC)
-- Ex. { "publication_end_at": "2026-08-01", "opposition_eligible": true }
