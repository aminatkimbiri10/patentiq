-- Extensions (compatibles Supabase hosted & local)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- Schéma utilitaire pour triggers et fonctions internes
CREATE SCHEMA IF NOT EXISTS app;
GRANT USAGE ON SCHEMA app TO postgres, service_role, authenticated;
