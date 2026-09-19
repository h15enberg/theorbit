CREATE OR REPLACE FUNCTION public.set_opportunity_timestamps()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  IF NEW.status IN ('Interview', 'Accepted', 'Rejected') AND (OLD.status IS DISTINCT FROM NEW.status OR OLD.responded_at IS NULL) THEN
    NEW.responded_at = now();
  ELSIF NEW.status NOT IN ('Interview', 'Accepted', 'Rejected') THEN
    NEW.responded_at = NULL;
  END IF;
  RETURN NEW;
END;
$$;