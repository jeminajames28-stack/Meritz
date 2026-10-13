/*
# Create tenant registration and voucher tables for Bintang Megamall 30th Anniversary

## Purpose
Allows mall tenants to register their shop information and submit vouchers
for the 30th anniversary celebration event. This is a public registration
form with no authentication — any tenant representative can submit.

## New Tables

### tenants
- `id` (uuid, primary key)
- `shop_name` (text, not null) — name of the tenant's shop
- `unit_lot_number` (text, not null) — shop unit/lot number in the mall
- `category` (text, not null) — shop category (F&B, Fashion, Services, etc.)
- `contact_person` (text, not null) — name of contact person
- `phone` (text, not null) — contact phone number
- `email` (text, not null) — contact email address
- `created_at` (timestamptz) — submission timestamp

### vouchers
- `id` (uuid, primary key)
- `tenant_id` (uuid, foreign key → tenants.id ON DELETE CASCADE)
- `title` (text, not null) — voucher title/name
- `discount_value` (text, not null) — discount amount or percentage
- `description` (text, not null) — what the voucher offers
- `valid_from` (date, not null) — voucher validity start date
- `valid_until` (date, not null) — voucher validity end date
- `quantity` (integer, not null, default 1) — number of vouchers available
- `terms` (text, not null) — terms and conditions
- `created_at` (timestamptz) — creation timestamp

## Security
- RLS enabled on both tables.
- Public CRUD for anon + authenticated (no sign-in required for this registration form).
- `USING (true)` is acceptable because this is intentionally a public registration form.

## Important Notes
1. No authentication — any tenant can register.
2. Vouchers are linked to tenants via foreign key with cascade delete.
3. All fields are validated on the frontend before submission.
*/

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

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_tenants" ON tenants;
CREATE POLICY "anon_select_tenants" ON tenants FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_tenants" ON tenants;
CREATE POLICY "anon_insert_tenants" ON tenants FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_tenants" ON tenants;
CREATE POLICY "anon_update_tenants" ON tenants FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_tenants" ON tenants;
CREATE POLICY "anon_delete_tenants" ON tenants FOR DELETE
TO anon, authenticated USING (true);

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

ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_vouchers" ON vouchers;
CREATE POLICY "anon_select_vouchers" ON vouchers FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_vouchers" ON vouchers;
CREATE POLICY "anon_insert_vouchers" ON vouchers FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_vouchers" ON vouchers;
CREATE POLICY "anon_update_vouchers" ON vouchers FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_vouchers" ON vouchers;
CREATE POLICY "anon_delete_vouchers" ON vouchers FOR DELETE
TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_vouchers_tenant_id ON vouchers(tenant_id);
