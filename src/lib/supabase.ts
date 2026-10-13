import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Tenant = {
  id: string;
  shop_name: string;
  unit_lot_number: string;
  category: string;
  contact_person: string;
  phone: string;
  email: string;
  created_at: string;
};

export type Voucher = {
  id: string;
  tenant_id: string;
  title: string;
  discount_value: string;
  description: string;
  valid_from: string;
  valid_until: string;
  quantity: number;
  terms: string;
  created_at: string;
};

export type VoucherInput = {
  title: string;
  discount_value: string;
  description: string;
  valid_from: string;
  valid_until: string;
  quantity: number;
  terms: string;
};

export type TenantInput = {
  shop_name: string;
  unit_lot_number: string;
  category: string;
  contact_person: string;
  phone: string;
  email: string;
};

export const SHOP_CATEGORIES = [
  'Food & Beverage',
  'Fashion & Apparel',
  'Departmental Store',
  'Electronics & Gadgets',
  'Health & Beauty',
  'Home & Living',
  'Jewellery & Accessories',
  'Entertainment',
  'Services',
  'Kids & Toys',
  'Sports & Outdoor',
  'Books & Stationery',
  'Other',
] as const;
