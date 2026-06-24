-- Dessin & modèle — surveillance portefeuille + veille techno

ALTER TYPE public.ip_asset_type ADD VALUE IF NOT EXISTS 'design';

CREATE TYPE public.tech_watch_kind AS ENUM ('patent', 'design');

ALTER TABLE public.ip_tech_watch
  ADD COLUMN IF NOT EXISTS watch_kind public.tech_watch_kind NOT NULL DEFAULT 'patent';

CREATE INDEX IF NOT EXISTS idx_ip_tech_watch_kind ON public.ip_tech_watch (watch_kind);
