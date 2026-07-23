-- Allow public event pages to read organizer profiles for live events
DROP POLICY IF EXISTS "Public can view organizers for live events" ON public.profiles;
CREATE POLICY "Public can view organizers for live events"
  ON public.profiles
  AS PERMISSIVE
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.events e
      WHERE e.user_id = profiles.id
        AND e.status = 'live'::public.event_status
    )
  );
