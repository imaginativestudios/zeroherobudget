

# Update Pricing to $12/month and $99/year

## Steps

### 1. Create new Stripe prices
Use Stripe tools to create two new prices:
- **Monthly**: $12/month recurring on the existing product
- **Annual**: $99/year recurring on the existing product

I'll use the product ID `prod_ToGDxQx1RgvD3J` from your Stripe account (the only product with existing prices).

### 2. Update `src/lib/constants.ts`
Update the `STRIPE_PRICES` config with new price IDs, amounts, and calculated savings:
- Monthly: `amount: 12`
- Annual: `amount: 99`, `savings: 45` ($144 - $99), `monthlyEquivalent: 8.25`

### 3. Update `supabase/functions/create-checkout/index.ts`
Replace the hardcoded `PRICE_IDS` with the new Stripe price IDs.

### 4. Update Pricing page copy
- Change the "Save $10" badge to "Save $45"
- All other references use `STRIPE_PRICES` constants so they'll update automatically

