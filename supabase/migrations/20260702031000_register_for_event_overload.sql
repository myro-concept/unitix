CREATE OR REPLACE FUNCTION public.register_for_event(p_data jsonb, p_event_id uuid)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT public.register_for_event(p_event_id, p_data);
$function$;