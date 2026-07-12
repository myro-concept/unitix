-- Do not create a reversed-parameter overload for register_for_event.
-- Supabase RPC can fail with "Could not choose the best candidate function"
-- when both (uuid, jsonb) and (jsonb, uuid) signatures exist.
DROP FUNCTION IF EXISTS public.register_for_event(jsonb, uuid);