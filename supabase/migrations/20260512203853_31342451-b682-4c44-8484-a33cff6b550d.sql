
CREATE OR REPLACE FUNCTION public.prevent_profile_subscription_field_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow service_role and postgres to make any change
  IF current_setting('request.jwt.claim.role', true) = 'service_role'
     OR current_user IN ('postgres', 'supabase_admin', 'service_role') THEN
    RETURN NEW;
  END IF;

  IF NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id
     OR NEW.subscription_tier IS DISTINCT FROM OLD.subscription_tier
     OR NEW.subscription_status IS DISTINCT FROM OLD.subscription_status
     OR NEW.subscription_amount IS DISTINCT FROM OLD.subscription_amount
     OR NEW.subscription_end IS DISTINCT FROM OLD.subscription_end THEN
    RAISE EXCEPTION 'Subscription and billing fields cannot be modified by users';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_profile_subscription_fields ON public.profiles;
CREATE TRIGGER guard_profile_subscription_fields
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_subscription_field_changes();
