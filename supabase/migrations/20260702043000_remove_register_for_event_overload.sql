-- Cleanup migration for environments that already applied the old overload.
-- Keep only public.register_for_event(uuid, jsonb).
DROP FUNCTION IF EXISTS public.register_for_event(jsonb, uuid);
