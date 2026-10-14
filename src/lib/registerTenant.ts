import { supabase, type TenantInput, type VoucherInput } from '@/lib/supabase';

const NETWORK_ERROR = "Couldn't send. Check your connection and try again.";
const INVALID_ERROR = 'Some details need checking. Please review and try again.';

/**
 * Saves the shop and its vouchers in one step. Visitors have no direct access
 * to the tables; see supabase/migrations/*_secure_tenant_registration.sql.
 * Errors are turned into plain messages; database text is never shown.
 */
export async function registerTenant(
  tenant: TenantInput,
  vouchers: VoucherInput[],
): Promise<{ id: string }> {
  let result;
  try {
    result = await supabase.rpc('register_tenant', {
      p_tenant: {
        shop_name: tenant.shop_name.trim(),
        unit_lot_number: tenant.unit_lot_number.trim(),
        category: tenant.category.trim(),
        contact_person: tenant.contact_person.trim(),
        phone: tenant.phone.trim(),
        email: tenant.email.trim(),
      },
      p_vouchers: vouchers.map((v) => ({
        title: v.title.trim(),
        discount_value: v.discount_value.trim(),
        description: v.description.trim(),
        valid_from: v.valid_from,
        valid_until: v.valid_until,
        quantity: v.quantity,
        terms: v.terms.trim(),
      })),
    });
  } catch {
    throw new Error(NETWORK_ERROR);
  }

  const { data: tenantId, error } = result;
  if (error) {
    console.error('register_tenant failed', error);
    // Postgres error codes (e.g. P0001 from the function's checks) mean the input was rejected.
    throw new Error(error.code && /^[0-9A-Z]{5}$/.test(error.code) ? INVALID_ERROR : NETWORK_ERROR);
  }
  if (!tenantId) throw new Error(NETWORK_ERROR);

  return { id: tenantId as string };
}
