import type { TenantInput } from '@/lib/supabase';
import {
  MAX_VOUCHERS,
  TENANT_FIELDS,
  VOUCHER_FIELDS,
  type TenantField,
  type VoucherField,
  type VoucherFields,
} from './validation';

// Unfinished registrations are kept in this browser only, so nothing typed is lost
// when the visitor leaves and comes back. Every storage call may throw (private
// mode, blocked storage), so the form must work without it.

export const DRAFT_KEY = 'bmm30-registration-draft-v1';

export type Step = 1 | 2 | 3;

export type TenantForm = TenantInput;

/** A voucher in the form. `id` is local only, for list keys and focus. */
export type VoucherForm = VoucherFields & { id: string };

export type Draft = {
  version: 1;
  tenant: TenantForm;
  vouchers: VoucherForm[];
  step: Step;
};

// Element ids shared by the flow and the steps, so focus can be moved after a render.
export const HEADING_ID = 'step-heading';
export const ADD_VOUCHER_ID = 'add-voucher';
export const SEND_ERROR_ID = 'send-error';
export const tenantFieldId = (field: TenantField) => `tenant-${field}`;
export const voucherFieldId = (voucherId: string, field: VoucherField) => `voucher-${voucherId}-${field}`;
export const voucherEditId = (voucherId: string) => `voucher-${voucherId}-edit`;

export function emptyTenant(): TenantForm {
  return {
    shop_name: '',
    unit_lot_number: '',
    category: '',
    contact_person: '',
    phone: '',
    email: '',
  };
}

let idCounter = 0;

function newId(): string {
  idCounter += 1;
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}-${idCounter}`;
}

export function emptyVoucher(): VoucherForm {
  return {
    id: newId(),
    title: '',
    discount_value: '',
    description: '',
    valid_from: '',
    valid_until: '',
    quantity: '1',
    terms: '',
  };
}

/** True when the visitor has typed anything worth keeping. */
export function hasContent(tenant: TenantForm, vouchers: readonly VoucherForm[]): boolean {
  if (TENANT_FIELDS.some((field) => tenant[field].trim() !== '')) return true;
  if (vouchers.length > 1) return true;
  return vouchers.some((voucher) =>
    VOUCHER_FIELDS.some((field) =>
      field === 'quantity' ? !['', '1'].includes(voucher.quantity.trim()) : voucher[field].trim() !== '',
    ),
  );
}

function resolveStorage(storage?: Storage): Storage | null {
  if (storage) return storage;
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isTenant(value: unknown): value is TenantForm {
  return isRecord(value) && TENANT_FIELDS.every((field) => typeof value[field] === 'string');
}

function isVoucher(value: unknown): value is VoucherForm {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    value.id !== '' &&
    VOUCHER_FIELDS.every((field) => typeof value[field] === 'string')
  );
}

function isDraft(value: unknown): value is Draft {
  return (
    isRecord(value) &&
    value.version === 1 &&
    (value.step === 1 || value.step === 2 || value.step === 3) &&
    isTenant(value.tenant) &&
    Array.isArray(value.vouchers) &&
    value.vouchers.length >= 1 &&
    value.vouchers.length <= MAX_VOUCHERS &&
    value.vouchers.every(isVoucher)
  );
}

function pickTenant(tenant: TenantForm): TenantForm {
  const picked = emptyTenant();
  for (const field of TENANT_FIELDS) picked[field] = tenant[field];
  return picked;
}

function pickVoucher(voucher: VoucherForm): VoucherForm {
  const picked: VoucherForm = { ...emptyVoucher(), id: voucher.id };
  for (const field of VOUCHER_FIELDS) picked[field] = voucher[field];
  return picked;
}

export function saveDraft(
  draft: { tenant: TenantForm; vouchers: readonly VoucherForm[]; step: Step },
  storage?: Storage,
): void {
  const target = resolveStorage(storage);
  if (!target) return;
  const data: Draft = {
    version: 1,
    tenant: pickTenant(draft.tenant),
    vouchers: draft.vouchers.map(pickVoucher),
    step: draft.step,
  };
  try {
    target.setItem(DRAFT_KEY, JSON.stringify(data));
  } catch {
    // Storage full or blocked: the form keeps working, the draft is just not kept.
  }
}

/** The saved draft, or null when there is none or it does not have the expected shape. */
export function loadDraft(storage?: Storage): Draft | null {
  const target = resolveStorage(storage);
  if (!target) return null;
  try {
    const raw = target.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isDraft(parsed)) return null;
    return {
      version: 1,
      tenant: pickTenant(parsed.tenant),
      vouchers: parsed.vouchers.map(pickVoucher),
      step: parsed.step,
    };
  } catch {
    return null;
  }
}

export function clearDraft(storage?: Storage): void {
  const target = resolveStorage(storage);
  if (!target) return;
  try {
    target.removeItem(DRAFT_KEY);
  } catch {
    // Blocked storage: there is nothing we can clear.
  }
}
