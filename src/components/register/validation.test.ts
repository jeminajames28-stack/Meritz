import { describe, expect, it, vi } from 'vitest';

// The real Supabase client needs env settings; the rules only need SHOP_CATEGORIES.
vi.mock('@supabase/supabase-js', () => ({ createClient: () => ({}) }));

import { SHOP_CATEGORIES, type TenantInput } from '@/lib/supabase';
import {
  MESSAGES,
  TENANT_FIELDS,
  TENANT_LABELS,
  VOUCHER_LABELS,
  errorCount,
  validateAll,
  validateTenant,
  validateTenantField,
  validateVoucher,
  voucherCountError,
  type VoucherLike,
} from './validation';

const TODAY = '2026-10-14';
const YESTERDAY = '2026-10-13';

function tenant(overrides: Partial<TenantInput> = {}): TenantInput {
  return {
    shop_name: 'Kopi Corner',
    unit_lot_number: 'LG-28',
    category: 'Food & Beverage',
    contact_person: 'Aisha Rahman',
    phone: '+60 12-345 6789',
    email: 'aisha@kopicorner.my',
    ...overrides,
  };
}

function voucher(overrides: Partial<VoucherLike> = {}): VoucherLike {
  return {
    title: '30% off storewide',
    discount_value: '30%',
    description: 'On all drinks and pastries.',
    valid_from: '2026-12-01',
    valid_until: '2026-12-31',
    quantity: '100',
    terms: 'One voucher per customer.',
    ...overrides,
  };
}

const chars = (n: number) => 'a'.repeat(n);

describe('validateTenant', () => {
  it('accepts complete shop details', () => {
    expect(validateTenant(tenant())).toEqual({});
  });

  it.each(TENANT_FIELDS)('requires %s after trimming', (field) => {
    const errors = validateTenant(tenant({ [field]: '   ' }));
    expect(errors[field]).toBe(`${TENANT_LABELS[field]} is required`);
  });

  it('uses the field labels in required messages', () => {
    const errors = validateTenant(tenant({ shop_name: '', unit_lot_number: '', contact_person: '' }));
    expect(errors.shop_name).toBe('Shop name is required');
    expect(errors.unit_lot_number).toBe('Unit / lot no. is required');
    expect(errors.contact_person).toBe('Contact person is required');
  });

  it('allows 199 and 200 characters and rejects 201', () => {
    expect(validateTenant(tenant({ shop_name: chars(199) })).shop_name).toBeUndefined();
    expect(validateTenant(tenant({ shop_name: chars(200) })).shop_name).toBeUndefined();
    expect(validateTenant(tenant({ shop_name: chars(201) })).shop_name).toBe('Use 200 characters or fewer');
  });

  it('counts length after trimming', () => {
    expect(validateTenant(tenant({ contact_person: `  ${chars(200)}  ` })).contact_person).toBeUndefined();
  });

  it('applies the length limit to every shop field', () => {
    const long = chars(201);
    const errors = validateTenant(tenant({ unit_lot_number: long, contact_person: long }));
    expect(errors.unit_lot_number).toBe(MESSAGES.tenantTooLong);
    expect(errors.contact_person).toBe(MESSAGES.tenantTooLong);
  });

  it.each(SHOP_CATEGORIES)('accepts the category %s', (category) => {
    expect(validateTenant(tenant({ category })).category).toBeUndefined();
  });

  it('rejects a category that is not in the list', () => {
    expect(validateTenant(tenant({ category: 'Pets' })).category).toBe('Choose a category');
    expect(validateTenant(tenant({ category: 'food & beverage' })).category).toBe('Choose a category');
  });

  it('asks for the category when it is empty', () => {
    expect(validateTenant(tenant({ category: '' })).category).toBe('Category is required');
  });

  it('accepts phone numbers with 7 or more digits and allowed characters', () => {
    for (const phone of ['1234567', '+60 12-345 6789', '(03) 1234 5678', '012-3456789']) {
      expect(validateTenant(tenant({ phone })).phone).toBeUndefined();
    }
  });

  it('rejects phone numbers with 6 digits', () => {
    expect(validateTenant(tenant({ phone: '123456' })).phone).toBe(
      'Enter a phone number with at least 7 digits',
    );
    expect(validateTenant(tenant({ phone: '+(12) 34-56' })).phone).toBe(MESSAGES.phone);
  });

  it('rejects phone numbers with other characters', () => {
    for (const phone of ['012 345 6789 ext 2', '012.345.6789', '012/3456789', 'call me']) {
      expect(validateTenant(tenant({ phone })).phone).toBe(MESSAGES.phone);
    }
  });

  it('accepts a basic email shape', () => {
    expect(validateTenant(tenant({ email: 'a@b.co' })).email).toBeUndefined();
    expect(validateTenant(tenant({ email: '  shop@mall.com.my  ' })).email).toBeUndefined();
  });

  it('rejects malformed email addresses', () => {
    for (const email of ['shop', 'shop@mall', '@mall.com', 'shop@.com.', 'sh op@mall.com', 'a@b@c.com']) {
      expect(validateTenant(tenant({ email })).email).toBe('Enter a valid email address');
    }
  });
});

describe('validateTenantField', () => {
  it('gives the same message as validateTenant for one field', () => {
    expect(validateTenantField('phone', '12')).toBe(MESSAGES.phone);
    expect(validateTenantField('email', ' aisha@kopicorner.my ')).toBeUndefined();
    expect(validateTenantField('shop_name', '  ')).toBe('Shop name is required');
  });
});

describe('validateVoucher', () => {
  it('accepts a complete voucher', () => {
    expect(validateVoucher(voucher(), TODAY)).toEqual({});
  });

  it.each(['title', 'discount_value', 'description', 'terms'] as const)(
    'requires %s after trimming',
    (field) => {
      const errors = validateVoucher(voucher({ [field]: '  ' }), TODAY);
      expect(errors[field]).toBe(`${VOUCHER_LABELS[field]} is required`);
    },
  );

  it('uses the voucher labels in required messages', () => {
    const errors = validateVoucher(
      voucher({ title: '', discount_value: '', description: '', terms: '' }),
      TODAY,
    );
    expect(errors).toMatchObject({
      title: 'Offer title is required',
      discount_value: 'Discount is required',
      description: 'Short description is required',
      terms: 'Terms is required',
    });
  });

  it('allows 5000 characters and rejects 5001 in text fields', () => {
    for (const field of ['title', 'discount_value', 'description', 'terms'] as const) {
      expect(validateVoucher(voucher({ [field]: chars(5000) }), TODAY)[field]).toBeUndefined();
      expect(validateVoucher(voucher({ [field]: chars(5001) }), TODAY)[field]).toBe(
        'Keep this under 5,000 characters',
      );
    }
  });

  it('requires both dates', () => {
    const errors = validateVoucher(voucher({ valid_from: '', valid_until: '' }), TODAY);
    expect(errors.valid_from).toBe('Choose a start date');
    expect(errors.valid_until).toBe('Choose an end date');
  });

  it('treats a malformed date as missing', () => {
    const errors = validateVoucher(voucher({ valid_from: '1/12/2026', valid_until: 'soon' }), TODAY);
    expect(errors.valid_from).toBe(MESSAGES.validFromRequired);
    expect(errors.valid_until).toBe(MESSAGES.validUntilRequired);
  });

  it('treats a day that does not exist as missing, as the database would reject it', () => {
    const errors = validateVoucher(voucher({ valid_from: '2026-02-30', valid_until: '2026-13-01' }), TODAY);
    expect(errors.valid_from).toBe(MESSAGES.validFromRequired);
    expect(errors.valid_until).toBe(MESSAGES.validUntilRequired);
  });

  it('accepts 29 February in a leap year only', () => {
    expect(validateVoucher(voucher({ valid_until: '2028-02-29' }), TODAY).valid_until).toBeUndefined();
    expect(validateVoucher(voucher({ valid_until: '2027-02-29' }), TODAY).valid_until).toBe(
      MESSAGES.validUntilRequired,
    );
  });

  it('allows the end date to equal the start date', () => {
    const errors = validateVoucher(voucher({ valid_from: '2026-12-01', valid_until: '2026-12-01' }), TODAY);
    expect(errors.valid_until).toBeUndefined();
  });

  it('rejects an end date before the start date', () => {
    const errors = validateVoucher(voucher({ valid_from: '2026-12-02', valid_until: '2026-12-01' }), TODAY);
    expect(errors.valid_until).toBe('End date must be on or after the start date');
  });

  it('accepts today as the end date', () => {
    const errors = validateVoucher(voucher({ valid_from: TODAY, valid_until: TODAY }), TODAY);
    expect(errors.valid_until).toBeUndefined();
  });

  it('rejects yesterday as the end date', () => {
    const errors = validateVoucher(voucher({ valid_from: '2026-10-01', valid_until: YESTERDAY }), TODAY);
    expect(errors.valid_until).toBe("End date can't be in the past");
  });

  it('allows a start date in the past when the end date is not', () => {
    const errors = validateVoucher(voucher({ valid_from: '2026-10-01', valid_until: TODAY }), TODAY);
    expect(errors.valid_from).toBeUndefined();
    expect(errors.valid_until).toBeUndefined();
  });

  it('names the start date rule first when both date rules fail', () => {
    const errors = validateVoucher(voucher({ valid_from: '2026-12-01', valid_until: YESTERDAY }), TODAY);
    expect(errors.valid_until).toBe(MESSAGES.untilBeforeFrom);
  });

  it('still checks the past rule when the start date is missing', () => {
    const errors = validateVoucher(voucher({ valid_from: '', valid_until: YESTERDAY }), TODAY);
    expect(errors.valid_from).toBe(MESSAGES.validFromRequired);
    expect(errors.valid_until).toBe(MESSAGES.untilInPast);
  });

  it.each([
    ['1', undefined],
    ['100000', undefined],
    [' 25 ', undefined],
    [1, undefined],
    [100000, undefined],
    ['0', MESSAGES.quantity],
    ['100001', MESSAGES.quantity],
    [0, MESSAGES.quantity],
    [100001, MESSAGES.quantity],
    ['1.5', MESSAGES.quantity],
    [1.5, MESSAGES.quantity],
    ['-1', MESSAGES.quantity],
    ['', MESSAGES.quantity],
    ['ten', MESSAGES.quantity],
    ['1e3', MESSAGES.quantity],
    [Number.NaN, MESSAGES.quantity],
  ] as const)('quantity %j gives %j', (quantity, expected) => {
    expect(validateVoucher(voucher({ quantity }), TODAY).quantity).toBe(expected);
  });

  it('uses the exact quantity message', () => {
    expect(MESSAGES.quantity).toBe('Quantity must be between 1 and 100,000');
  });
});

describe('voucherCountError', () => {
  it('allows 1 to 20 vouchers', () => {
    expect(voucherCountError(1)).toBeUndefined();
    expect(voucherCountError(20)).toBeUndefined();
  });

  it('rejects 0 and 21 vouchers', () => {
    expect(voucherCountError(0)).toBe('Add at least one voucher');
    expect(voucherCountError(21)).toBe('You can add up to 20 vouchers');
  });
});

describe('errorCount', () => {
  it('counts only fields with a message', () => {
    expect(errorCount({})).toBe(0);
    expect(errorCount({ shop_name: 'x', phone: 'y', email: undefined })).toBe(2);
  });
});

describe('validateAll', () => {
  it('returns null when everything is valid', () => {
    expect(validateAll(tenant(), [voucher(), voucher()], TODAY)).toBeNull();
  });

  it('returns the first shop field in form order', () => {
    const result = validateAll(tenant({ phone: '12', category: 'Pets' }), [voucher()], TODAY);
    expect(result).toEqual({ step: 1, field: 'category', message: MESSAGES.category });
  });

  it('reports shop errors before voucher errors', () => {
    const result = validateAll(tenant({ email: 'nope' }), [voucher({ title: '' })], TODAY);
    expect(result).toEqual({ step: 1, field: 'email', message: MESSAGES.email });
  });

  it('returns the first voucher and field with an error', () => {
    const result = validateAll(
      tenant(),
      [
        voucher(),
        voucher({ terms: '', valid_from: '2026-10-01', valid_until: YESTERDAY }),
        voucher({ title: '' }),
      ],
      TODAY,
    );
    expect(result).toEqual({
      step: 2,
      field: 'valid_until',
      voucherIndex: 1,
      message: MESSAGES.untilInPast,
    });
  });

  it('rejects an empty voucher list', () => {
    expect(validateAll(tenant(), [], TODAY)).toEqual({
      step: 2,
      field: 'vouchers',
      message: 'Add at least one voucher',
    });
  });

  it('accepts 20 vouchers and rejects 21', () => {
    expect(validateAll(tenant(), Array.from({ length: 20 }, () => voucher()), TODAY)).toBeNull();
    expect(validateAll(tenant(), Array.from({ length: 21 }, () => voucher()), TODAY)).toEqual({
      step: 2,
      field: 'vouchers',
      message: 'You can add up to 20 vouchers',
    });
  });
});
