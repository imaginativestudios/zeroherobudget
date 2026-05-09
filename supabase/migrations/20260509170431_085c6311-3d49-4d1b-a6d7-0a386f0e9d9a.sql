
REVOKE SELECT (access_token) ON public.plaid_items FROM authenticated, anon;
REVOKE ALL ON public.plaid_items FROM anon;
