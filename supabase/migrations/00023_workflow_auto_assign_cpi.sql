-- Active l'assignation CPI automatique à la soumission
UPDATE public.settings
SET
  value = value || '{"auto_assign_cpi": true, "auto_move_to_in_review": true}'::JSONB,
  updated_at = NOW()
WHERE key = 'workflow';
