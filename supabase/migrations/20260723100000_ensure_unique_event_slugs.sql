-- Guarantee unique event slugs at the database level.
CREATE OR REPLACE FUNCTION public.ensure_unique_event_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug text;
  candidate_slug text;
  suffix integer := 1;
BEGIN
  base_slug := lower(regexp_replace(coalesce(NEW.slug, NEW.name, ''), '[^a-z0-9]+', '-', 'g'));
  base_slug := regexp_replace(base_slug, '(^-|-$)', '', 'g');

  IF base_slug = '' THEN
    base_slug := 'event';
  END IF;

  candidate_slug := base_slug;

  WHILE EXISTS (
    SELECT 1
    FROM public.events e
    WHERE e.slug = candidate_slug
      AND (TG_OP = 'INSERT' OR e.id <> NEW.id)
  ) LOOP
    suffix := suffix + 1;
    candidate_slug := base_slug || '-' || suffix::text;
  END LOOP;

  NEW.slug := candidate_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
DROP TRIGGER IF EXISTS ensure_unique_event_slug_trigger ON public.events;
CREATE TRIGGER ensure_unique_event_slug_trigger
BEFORE INSERT OR UPDATE OF slug, name ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.ensure_unique_event_slug();
