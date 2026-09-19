CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 160),
  organization TEXT NOT NULL CHECK (char_length(organization) BETWEEN 1 AND 160),
  opportunity_type TEXT NOT NULL CHECK (opportunity_type IN ('Job', 'Internship', 'Scholarship', 'Competition')),
  deadline DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Applied' CHECK (status IN ('Applied', 'Interview', 'Accepted', 'Rejected', 'No Response Yet')),
  note TEXT CHECK (note IS NULL OR char_length(note) <= 2000),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.opportunities TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.opportunities TO authenticated;
GRANT ALL ON public.opportunities TO service_role;

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public single-user opportunity access"
ON public.opportunities
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.set_opportunity_timestamps()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  IF NEW.status IN ('Accepted', 'Rejected') AND (OLD.status IS DISTINCT FROM NEW.status OR OLD.responded_at IS NULL) THEN
    NEW.responded_at = now();
  ELSIF NEW.status NOT IN ('Accepted', 'Rejected') THEN
    NEW.responded_at = NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_opportunity_timestamps_before_update
BEFORE UPDATE ON public.opportunities
FOR EACH ROW
EXECUTE FUNCTION public.set_opportunity_timestamps();

CREATE INDEX opportunities_deadline_idx ON public.opportunities (deadline ASC);