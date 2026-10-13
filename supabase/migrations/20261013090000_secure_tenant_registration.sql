/*
# Secure tenant registration for Bintang Megamall 30th Anniversary

## Purpose
Complete database setup for the tenant registration page. Safe to run on a
brand new Supabase project, and safe to run on the project created by the
earlier migration (it removes the open access that one added).

## Tables
- `tenants`: one row per registered shop.
- `vouchers`: the vouchers a shop submits, linked to `tenants`.

## Security
- Website visitors cannot read, change or delete any row.
- The only thing a visitor can do is call `register_tenant`, which checks the
  input and saves one shop with its vouchers in a single step.
- Registrations are viewed in the Supabase dashboard (Table Editor), which is
  not affected by these rules.
*/

-- Tables

CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_name text NOT NULL,
  unit_lot_number text NOT NULL,
  category text NOT NULL,
  contact_person text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title text NOT NULL,
  discount_value text NOT NULL,
  description text NOT NULL,
  valid_from date NOT NULL,
  valid_until date NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  terms text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vouchers_tenant_id ON vouchers(tenant_id);

-- Lock the tables: row level security on, no visitor policies

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_tenants" ON tenants;
DROP POLICY IF EXISTS "anon_insert_tenants" ON tenants;
DROP POLICY IF EXISTS "anon_update_tenants" ON tenants;
DROP POLICY IF EXISTS "anon_delete_tenants" ON tenants;

DROP POLICY IF EXISTS "anon_select_vouchers" ON vouchers;
DROP POLICY IF EXISTS "anon_insert_vouchers" ON vouchers;
DROP POLICY IF EXISTS "anon_update_vouchers" ON vouchers;
DROP POLICY IF EXISTS "anon_delete_vouchers" ON vouchers;

REVOKE ALL ON tenants, vouchers FROM anon, authenticated;

-- The one entry point the website uses

CREATE OR REPLACE FUNCTION public.register_tenant(p_tenant jsonb, p_vouchers jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_tenant_id uuid;
  v jsonb;
  f text;
BEGIN
  IF jsonb_typeof(p_tenant) IS DISTINCT FROM 'object' THEN
    RAISE EXCEPTION 'Shop details are missing.';
  END IF;

  FOREACH f IN ARRAY ARRAY['shop_name', 'unit_lot_number', 'category', 'contact_person', 'phone', 'email'] LOOP
    IF coalesce(btrim(p_tenant->>f), '') = '' THEN
      RAISE EXCEPTION 'Shop detail "%" is required.', f;
    END IF;
    IF length(p_tenant->>f) > 200 THEN
      RAISE EXCEPTION 'Shop detail "%" is too long.', f;
    END IF;
  END LOOP;

  IF jsonb_typeof(p_vouchers) IS DISTINCT FROM 'array' OR jsonb_array_length(p_vouchers) = 0 THEN
    RAISE EXCEPTION 'Please add at least one voucher.';
  END IF;
  IF jsonb_array_length(p_vouchers) > 20 THEN
    RAISE EXCEPTION 'A registration can have at most 20 vouchers.';
  END IF;

  INSERT INTO public.tenants (shop_name, unit_lot_number, category, contact_person, phone, email)
  VALUES (
    btrim(p_tenant->>'shop_name'),
    btrim(p_tenant->>'unit_lot_number'),
    btrim(p_tenant->>'category'),
    btrim(p_tenant->>'contact_person'),
    btrim(p_tenant->>'phone'),
    btrim(p_tenant->>'email')
  )
  RETURNING id INTO v_tenant_id;

  FOR v IN SELECT value FROM jsonb_array_elements(p_vouchers) LOOP
    FOREACH f IN ARRAY ARRAY['title', 'discount_value', 'description', 'valid_from', 'valid_until', 'terms'] LOOP
      IF coalesce(btrim(v->>f), '') = '' THEN
        RAISE EXCEPTION 'Voucher detail "%" is required.', f;
      END IF;
      IF length(v->>f) > 5000 THEN
        RAISE EXCEPTION 'Voucher detail "%" is too long.', f;
      END IF;
    END LOOP;

    IF (v->>'valid_until')::date < (v->>'valid_from')::date THEN
      RAISE EXCEPTION 'Voucher end date must be after the start date.';
    END IF;
    IF coalesce((v->>'quantity')::int, 0) < 1 THEN
      RAISE EXCEPTION 'Voucher quantity must be at least 1.';
    END IF;

    INSERT INTO public.vouchers (tenant_id, title, discount_value, description, valid_from, valid_until, quantity, terms)
    VALUES (
      v_tenant_id,
      btrim(v->>'title'),
      btrim(v->>'discount_value'),
      btrim(v->>'description'),
      (v->>'valid_from')::date,
      (v->>'valid_until')::date,
      (v->>'quantity')::int,
      btrim(v->>'terms')
    );
  END LOOP;

  RETURN v_tenant_id;
END;
$$;

REVOKE ALL ON FUNCTION public.register_tenant(jsonb, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_tenant(jsonb, jsonb) TO anon, authenticated;
