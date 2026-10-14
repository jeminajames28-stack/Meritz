import { SHOP_CATEGORIES, type TenantInput } from '@/lib/supabase';

// Pure rules for the registration form. They mirror the register_tenant database
// function, so nothing that passes here is rejected on send.

export type TenantField = keyof TenantInput;

/** Voucher fields as the form holds them. Quantity stays text until it is sent. */
export type VoucherFields = {
  title: string;
  discount_value: string;
  description: string;
  valid_from: string;
  valid_until: string;
  quantity: string;
  terms: string;
};

export type VoucherField = keyof VoucherFields;

/** Accepts a numeric quantity too, so already converted vouchers can be checked. */
export type VoucherLike = Omit<VoucherFields, 'quantity'> & { quantity: string | number };

export type TenantErrors = Partial<Record<TenantField, string>>;
export type VoucherErrors = Partial<Record<VoucherField, string>>;

export const TENANT_FIELDS: readonly TenantField[] = [
  'shop_name',
  'unit_lot_number',
  'category',
  'contact_person',
  'phone',
  'email',
];

export const VOUCHER_FIELDS: readonly VoucherField[] = [
  'title',
  'discount_value',
  'description',
  'valid_from',
  'valid_until',
  'quantity',
  'terms',
];

export const TENANT_LABELS: Record<TenantField, string> = {
  shop_name: 'Shop name',
  unit_lot_number: 'Unit / lot no.',
  category: 'Category',
  contact_person: 'Contact person',
  phone: 'Phone',
  email: 'Email',
};

export const VOUCHER_LABELS: Record<VoucherField, string> = {
  title: 'Offer title',
  discount_value: 'Discount',
  description: 'Short description',
  valid_from: 'Valid from',
  valid_until: 'Valid until',
  quantity: 'Quantity',
  terms: 'Terms',
};

export const TENANT_MAX_LENGTH = 200;
export const VOUCHER_TEXT_MAX_LENGTH = 5000;
export const MIN_PHONE_DIGITS = 7;
export const MIN_QUANTITY = 1;
export const MAX_QUANTITY = 100000;
export const MIN_VOUCHERS = 1;
export const MAX_VOUCHERS = 20;

export const MESSAGES = {
  required: (label: string) => `${label} is required`,
  tenantTooLong: 'Use 200 characters or fewer',
  category: 'Choose a category',
  phone: 'Enter a phone number with at least 7 digits',
  email: 'Enter a valid email address',
  voucherTooLong: 'Keep this under 5,000 characters',
  validFromRequired: 'Choose a start date',
  validUntilRequired: 'Choose an end date',
  untilBeforeFrom: 'End date must be on or after the start date',
  untilInPast: "End date can't be in the past",
  quantity: 'Quantity must be between 1 and 100,000',
  tooFewVouchers: 'Add at least one voucher',
  tooManyVouchers: 'You can add up to 20 vouchers',
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_CHARS = /^[0-9 +\-()]+$/;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const VOUCHER_TEXT_FIELDS = ['title', 'discount_value', 'description', 'terms'] as const;

/** The error for one shop field, or undefined when the value is fine. */
export function validateTenantField(field: TenantField, raw: string): string | undefined {
  const value = raw.trim();
  if (!value) return MESSAGES.required(TENANT_LABELS[field]);
  if (value.length > TENANT_MAX_LENGTH) return MESSAGES.tenantTooLong;
  if (field === 'category' && !(SHOP_CATEGORIES as readonly string[]).includes(value)) {
    return MESSAGES.category;
  }
  if (field === 'phone') {
    const digits = value.replace(/\D/g, '').length;
    if (!PHONE_CHARS.test(value) || digits < MIN_PHONE_DIGITS) return MESSAGES.phone;
  }
  if (field === 'email' && !EMAIL_PATTERN.test(value)) return MESSAGES.email;
  return undefined;
}

/** All errors for the shop details, keyed by field. Empty object when valid. */
export function validateTenant(tenant: TenantInput): TenantErrors {
  const errors: TenantErrors = {};
  for (const field of TENANT_FIELDS) {
    const error = validateTenantField(field, tenant[field] ?? '');
    if (error) errors[field] = error;
  }
  return errors;
}

/** 'YYYY-MM-DD' for a day that exists. The database rejects dates like 2026-02-30. */
function isIsoDate(value: string): boolean {
  const match = ISO_DATE.exec(value);
  if (!match) return false;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function parseQuantity(quantity: string | number): number {
  if (typeof quantity === 'number') return quantity;
  const trimmed = quantity.trim();
  return /^\d+$/.test(trimmed) ? Number(trimmed) : Number.NaN;
}

/**
 * All errors for one voucher, keyed by field. `today` is 'YYYY-MM-DD' in Malaysia
 * time (see todayInMalaysia). Empty object when valid.
 */
export function validateVoucher(voucher: VoucherLike, today: string): VoucherErrors {
  const errors: VoucherErrors = {};

  for (const field of VOUCHER_TEXT_FIELDS) {
    const value = (voucher[field] ?? '').trim();
    if (!value) errors[field] = MESSAGES.required(VOUCHER_LABELS[field]);
    else if (value.length > VOUCHER_TEXT_MAX_LENGTH) errors[field] = MESSAGES.voucherTooLong;
  }

  const from = (voucher.valid_from ?? '').trim();
  const until = (voucher.valid_until ?? '').trim();
  const hasFrom = isIsoDate(from);
  const hasUntil = isIsoDate(until);
  if (!hasFrom) errors.valid_from = MESSAGES.validFromRequired;
  if (!hasUntil) errors.valid_until = MESSAGES.validUntilRequired;
  // ISO dates compare correctly as strings.
  else if (hasFrom && until < from) errors.valid_until = MESSAGES.untilBeforeFrom;
  else if (until < today) errors.valid_until = MESSAGES.untilInPast;

  const quantity = parseQuantity(voucher.quantity ?? '');
  if (!Number.isInteger(quantity) || quantity < MIN_QUANTITY || quantity > MAX_QUANTITY) {
    errors.quantity = MESSAGES.quantity;
  }

  return errors;
}

/** Error for the number of vouchers, or undefined when the count is allowed. */
export function voucherCountError(count: number): string | undefined {
  if (count < MIN_VOUCHERS) return MESSAGES.tooFewVouchers;
  if (count > MAX_VOUCHERS) return MESSAGES.tooManyVouchers;
  return undefined;
}

export function errorCount(errors: TenantErrors | VoucherErrors): number {
  return Object.values(errors).filter(Boolean).length;
}

export type FirstError =
  | { step: 1; field: TenantField; message: string }
  | { step: 2; field: VoucherField; voucherIndex: number; message: string }
  | { step: 2; field: 'vouchers'; message: string };

/**
 * Runs every rule in form order and returns the first failure, or null when the
 * whole registration can be sent.
 */
export function validateAll(
  tenant: TenantInput,
  vouchers: readonly VoucherLike[],
  today: string,
): FirstError | null {
  const tenantErrors = validateTenant(tenant);
  for (const field of TENANT_FIELDS) {
    const message = tenantErrors[field];
    if (message) return { step: 1, field, message };
  }

  const countError = voucherCountError(vouchers.length);
  if (countError) return { step: 2, field: 'vouchers', message: countError };

  for (let voucherIndex = 0; voucherIndex < vouchers.length; voucherIndex += 1) {
    const voucherErrors = validateVoucher(vouchers[voucherIndex], today);
    for (const field of VOUCHER_FIELDS) {
      const message = voucherErrors[field];
      if (message) return { step: 2, field, voucherIndex, message };
    }
  }

  return null;
}
