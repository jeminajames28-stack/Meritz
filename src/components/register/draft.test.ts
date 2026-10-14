import { beforeEach, describe, expect, it, vi } from 'vitest';

// validation.ts reads SHOP_CATEGORIES from the Supabase module; keep the real client out.
vi.mock('@supabase/supabase-js', () => ({ createClient: () => ({}) }));

import {
  DRAFT_KEY,
  clearDraft,
  emptyTenant,
  emptyVoucher,
  hasContent,
  loadDraft,
  saveDraft,
  type Draft,
  type TenantForm,
  type VoucherForm,
} from './draft';

class MemoryStorage implements Storage {
  [name: string]: unknown;
  private items = new Map<string, string>();
  get length() {
    return this.items.size;
  }
  clear() {
    this.items.clear();
  }
  getItem(key: string) {
    return this.items.has(key) ? (this.items.get(key) as string) : null;
  }
  key(index: number) {
    return Array.from(this.items.keys())[index] ?? null;
  }
  removeItem(key: string) {
    this.items.delete(key);
  }
  setItem(key: string, value: string) {
    this.items.set(key, value);
  }
}

class BrokenStorage implements Storage {
  [name: string]: unknown;
  get length(): number {
    throw new Error('blocked');
  }
  clear(): void {
    throw new Error('blocked');
  }
  getItem(): string | null {
    throw new Error('blocked');
  }
  key(): string | null {
    throw new Error('blocked');
  }
  removeItem(): void {
    throw new Error('blocked');
  }
  setItem(): void {
    throw new DOMException('QuotaExceededError');
  }
}

const tenant: TenantForm = {
  shop_name: 'Kopi Corner',
  unit_lot_number: 'LG-28',
  category: 'Food & Beverage',
  contact_person: 'Aisha Rahman',
  phone: '+60 12-345 6789',
  email: 'aisha@kopicorner.my',
};

const voucher: VoucherForm = {
  id: 'v1',
  title: '30% off storewide',
  discount_value: '30%',
  description: 'On all drinks.',
  valid_from: '2026-12-01',
  valid_until: '2026-12-31',
  quantity: '100',
  terms: 'One per customer.',
};

function validDraft(overrides: Record<string, unknown> = {}) {
  return { version: 1, tenant, vouchers: [voucher], step: 2, ...overrides };
}

let storage: MemoryStorage;

beforeEach(() => {
  storage = new MemoryStorage();
});

describe('saveDraft and loadDraft', () => {
  it('round-trips tenant, vouchers and step', () => {
    saveDraft({ tenant, vouchers: [voucher, { ...voucher, id: 'v2' }], step: 3 }, storage);
    expect(loadDraft(storage)).toEqual<Draft>({
      version: 1,
      tenant,
      vouchers: [voucher, { ...voucher, id: 'v2' }],
      step: 3,
    });
  });

  it('stores version 1 JSON under the agreed key', () => {
    saveDraft({ tenant, vouchers: [voucher], step: 1 }, storage);
    const raw = storage.getItem('bmm30-registration-draft-v1');
    expect(DRAFT_KEY).toBe('bmm30-registration-draft-v1');
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw as string)).toEqual({ version: 1, tenant, vouchers: [voucher], step: 1 });
  });

  it('drops unknown properties', () => {
    const extra = { ...tenant, password: 'x' } as TenantForm;
    saveDraft({ tenant: extra, vouchers: [{ ...voucher, extra: 1 } as VoucherForm], step: 1 }, storage);
    const raw = JSON.parse(storage.getItem(DRAFT_KEY) as string);
    expect(raw.tenant).not.toHaveProperty('password');
    expect(raw.vouchers[0]).not.toHaveProperty('extra');
  });

  it('returns null when nothing is saved', () => {
    expect(loadDraft(storage)).toBeNull();
  });

  it('returns null for text that is not JSON', () => {
    storage.setItem(DRAFT_KEY, '{not json');
    expect(loadDraft(storage)).toBeNull();
  });

  it.each([
    ['another version', validDraft({ version: 2 })],
    ['a missing version', validDraft({ version: undefined })],
    ['step 0', validDraft({ step: 0 })],
    ['step 4', validDraft({ step: 4 })],
    ['step as text', validDraft({ step: '2' })],
    ['a missing tenant', validDraft({ tenant: undefined })],
    ['a tenant field that is not text', validDraft({ tenant: { ...tenant, phone: 123 } })],
    ['a tenant with a missing field', validDraft({ tenant: { ...tenant, email: undefined } })],
    ['vouchers that are not a list', validDraft({ vouchers: voucher })],
    ['no vouchers', validDraft({ vouchers: [] })],
    ['21 vouchers', validDraft({ vouchers: Array.from({ length: 21 }, (_, i) => ({ ...voucher, id: `v${i}` })) })],
    ['a voucher without id', validDraft({ vouchers: [{ ...voucher, id: undefined }] })],
    ['a voucher with a numeric quantity', validDraft({ vouchers: [{ ...voucher, quantity: 1 }] })],
    ['a list instead of an object', [validDraft()]],
    ['null', null],
  ])('returns null for %s', (_label, value) => {
    storage.setItem(DRAFT_KEY, JSON.stringify(value));
    expect(loadDraft(storage)).toBeNull();
  });

  it('accepts exactly 20 vouchers', () => {
    const vouchers = Array.from({ length: 20 }, (_, i) => ({ ...voucher, id: `v${i}` }));
    storage.setItem(DRAFT_KEY, JSON.stringify(validDraft({ vouchers })));
    expect(loadDraft(storage)?.vouchers).toHaveLength(20);
  });
});

describe('clearDraft', () => {
  it('removes the saved draft', () => {
    saveDraft({ tenant, vouchers: [voucher], step: 2 }, storage);
    clearDraft(storage);
    expect(storage.getItem(DRAFT_KEY)).toBeNull();
    expect(loadDraft(storage)).toBeNull();
  });
});

describe('when storage is unavailable', () => {
  it('never throws when every call fails', () => {
    const broken = new BrokenStorage();
    expect(() => saveDraft({ tenant, vouchers: [voucher], step: 1 }, broken)).not.toThrow();
    expect(loadDraft(broken)).toBeNull();
    expect(() => clearDraft(broken)).not.toThrow();
  });

  it('works without a window (default storage)', () => {
    expect(typeof window).toBe('undefined');
    expect(() => saveDraft({ tenant, vouchers: [voucher], step: 1 })).not.toThrow();
    expect(loadDraft()).toBeNull();
    expect(() => clearDraft()).not.toThrow();
  });

  it('falls back to null when window.localStorage throws', () => {
    vi.stubGlobal('window', {
      get localStorage(): Storage {
        throw new DOMException('SecurityError');
      },
    });
    try {
      expect(loadDraft()).toBeNull();
      expect(() => saveDraft({ tenant, vouchers: [voucher], step: 1 })).not.toThrow();
      expect(() => clearDraft()).not.toThrow();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('uses window.localStorage by default when it exists', () => {
    const local = new MemoryStorage();
    vi.stubGlobal('window', { localStorage: local });
    try {
      saveDraft({ tenant, vouchers: [voucher], step: 2 });
      expect(local.getItem(DRAFT_KEY)).not.toBeNull();
      expect(loadDraft()?.step).toBe(2);
      clearDraft();
      expect(local.getItem(DRAFT_KEY)).toBeNull();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe('form helpers', () => {
  it('starts with an empty tenant and one voucher with quantity 1', () => {
    expect(Object.values(emptyTenant()).every((value) => value === '')).toBe(true);
    const fresh = emptyVoucher();
    expect(fresh.quantity).toBe('1');
    expect(fresh.id).not.toBe('');
  });

  it('gives every new voucher its own id', () => {
    const ids = new Set(Array.from({ length: 50 }, () => emptyVoucher().id));
    expect(ids.size).toBe(50);
  });

  it('treats an untouched form as empty', () => {
    expect(hasContent(emptyTenant(), [emptyVoucher()])).toBe(false);
    expect(hasContent(emptyTenant(), [{ ...emptyVoucher(), title: '   ' }])).toBe(false);
  });

  it('detects typed shop details, voucher text, a changed quantity or extra vouchers', () => {
    expect(hasContent({ ...emptyTenant(), phone: '0' }, [emptyVoucher()])).toBe(true);
    expect(hasContent(emptyTenant(), [{ ...emptyVoucher(), terms: 'x' }])).toBe(true);
    expect(hasContent(emptyTenant(), [{ ...emptyVoucher(), quantity: '5' }])).toBe(true);
    expect(hasContent(emptyTenant(), [emptyVoucher(), emptyVoucher()])).toBe(true);
  });
});
