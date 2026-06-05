
CREATE TABLE public.beta_invite_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  max_uses integer,
  used_count integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.beta_invite_codes TO authenticated;
GRANT ALL ON public.beta_invite_codes TO service_role;

ALTER TABLE public.beta_invite_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view beta invite codes"
  ON public.beta_invite_codes FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert beta invite codes"
  ON public.beta_invite_codes FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update beta invite codes"
  ON public.beta_invite_codes FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete beta invite codes"
  ON public.beta_invite_codes FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_beta_invite_codes_updated_at
  BEFORE UPDATE ON public.beta_invite_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
