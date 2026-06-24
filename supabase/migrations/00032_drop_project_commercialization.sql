-- Suppression module valorisation / commercialisation (retiré de l'app)

DROP POLICY IF EXISTS "project_commercialization_update" ON public.project_commercialization;
DROP POLICY IF EXISTS "project_commercialization_upsert" ON public.project_commercialization;
DROP POLICY IF EXISTS "project_commercialization_select" ON public.project_commercialization;

DROP TABLE IF EXISTS public.project_commercialization;

DROP TYPE IF EXISTS public.commercial_status;
