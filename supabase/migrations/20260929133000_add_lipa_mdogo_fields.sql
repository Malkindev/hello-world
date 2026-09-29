-- Add configurable Lipa Mdogo Mdogo starting-payment data to catalogue products.
-- The value is per product so admins can set the advertised starting amount
-- and whether that amount is shown per day, week, or month.

alter table public.products
  add column if not exists lipa_mdogo_start_amount numeric check (lipa_mdogo_start_amount is null or lipa_mdogo_start_amount >= 0),
  add column if not exists lipa_mdogo_start_frequency text check (
    lipa_mdogo_start_frequency is null
    or lipa_mdogo_start_frequency in ('daily', 'weekly', 'monthly')
  );

-- Existing phones get a price-derived starting figure rather than a
-- hard-coded product-specific amount. Accessories remain without financing.
update public.products
set
  lipa_mdogo_start_amount = ceil(price / 12.0),
  lipa_mdogo_start_frequency = 'weekly'
where kind = 'phone'
  and price > 0
  and lipa_mdogo_start_amount is null;

update public.products
set
  lipa_mdogo_start_amount = null,
  lipa_mdogo_start_frequency = null
where kind <> 'phone'
  and (lipa_mdogo_start_amount is not null or lipa_mdogo_start_frequency is not null);
