-- Seed — rôles, catégories, paramètres globaux
-- Exécuter après migrations : supabase db reset (local) ou supabase db seed

-- Rôles applicatifs
INSERT INTO public.roles (role_name, display_name, description) VALUES
  ('project_holder', 'Porteur de projet', 'Crée et suit ses projets, documents et recherches'),
  ('cpi_advisor', 'Conseiller PI / Avocat', 'Analyse, commente et valide les dossiers assignés'),
  ('expert', 'Expert métier', 'Évalue la faisabilité technique et recommande'),
  ('admin', 'Administrateur', 'Gestion plateforme, utilisateurs et paramètres')
ON CONFLICT (role_name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Catégories projet (exemples)
INSERT INTO public.categories (name, slug, description, sort_order) VALUES
  ('Brevet d''invention', 'brevet', 'Demandes et stratégies brevet', 10),
  ('Modèle d''utilité', 'modele-utilite', 'Protection par modèle d''utilité', 20),
  ('Marque', 'marque', 'Signes distinctifs et marques', 30),
  ('Dessin & modèle', 'dessin-modele', 'Apparence et design', 40),
  ('Secret d''affaires', 'secret-affaires', 'Savoir-faire et confidentialité', 50),
  ('Veille & liberté d''exploitation', 'veille', 'Recherches d''antériorité et FTO', 60),
  ('Autre', 'autre', 'Autres besoins PI', 99)
ON CONFLICT (slug) DO NOTHING;

-- Tags par défaut
INSERT INTO public.tags (name, slug, color) VALUES
  ('Prioritaire', 'prioritaire', '#ef4444'),
  ('Brouillon', 'brouillon', '#94a3b8'),
  ('En attente client', 'attente-client', '#f59e0b'),
  ('Validé CPI', 'valide-cpi', '#22c55e'),
  ('Expertise requise', 'expertise', '#8b5cf6'),
  ('IA — analyse lancée', 'ia-analyse', '#06b6d4')
ON CONFLICT (slug) DO NOTHING;

-- Paramètres globaux
INSERT INTO public.settings (key, value, description, is_public) VALUES
  (
    'app',
    '{"name": "Patent Platform", "default_locale": "fr", "support_email": "support@example.com"}'::JSONB,
    'Métadonnées application',
    TRUE
  ),
  (
    'upload',
    '{"max_file_size_mb": 50, "allowed_extensions": ["pdf","docx","doc","png","jpg","jpeg","csv"]}'::JSONB,
    'Limites upload documents',
    FALSE
  ),
  (
    'ai',
    '{"enabled": false, "providers": [], "features": {"novelty": true, "semantic": true, "summarization": true, "classification": true, "similarity": true, "assistant": true, "report": true}}'::JSONB,
    'Configuration IA (placeholders)',
    FALSE
  ),
  (
    'workflow',
    '{"default_project_status": "draft", "auto_assign_cpi": true, "auto_move_to_in_review": true}'::JSONB,
    'Workflow métier',
    FALSE
  )
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = NOW();
