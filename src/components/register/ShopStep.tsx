import type { ChangeEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import Field from '@/components/ui/Field';
import { SHOP_CATEGORIES } from '@/lib/supabase';
import { HEADING_ID, tenantFieldId, type TenantForm } from './draft';
import { TENANT_LABELS, type TenantErrors, type TenantField } from './validation';

type Props = {
  tenant: TenantForm;
  errors: TenantErrors;
  /** The visitor came here from Review, so the main button returns there. */
  fromReview: boolean;
  onChange: (field: TenantField, value: string) => void;
  onBlur: (field: TenantField) => void;
  onContinue: () => void;
};

/** Step 1: who the shop is and how to reach them. */
export default function ShopStep({ tenant, errors, fromReview, onChange, onBlur, onContinue }: Props) {
  const common = (field: TenantField) => ({
    label: TENANT_LABELS[field],
    id: tenantFieldId(field),
    error: errors[field],
    required: true,
  });

  const inputProps = (field: TenantField) => ({
    name: field,
    value: tenant[field],
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => onChange(field, event.target.value),
    onBlur: () => onBlur(field),
  });

  return (
    <>
      <h1 id={HEADING_ID} tabIndex={-1} className="h-section focus:outline-none">
        Shop details
      </h1>
      <form
        noValidate
        className="mt-10"
        onSubmit={(event) => {
          event.preventDefault();
          onContinue();
        }}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <Field {...common('shop_name')} input={{ ...inputProps('shop_name'), type: 'text', autoComplete: 'organization' }} />
          <Field
            {...common('unit_lot_number')}
            hint="e.g. LG-28"
            input={{ ...inputProps('unit_lot_number'), type: 'text', autoComplete: 'off' }}
          />
          <Field
            {...common('category')}
            select={{
              ...inputProps('category'),
              autoComplete: 'off',
              options: SHOP_CATEGORIES,
              placeholder: 'Choose a category',
            }}
          />
          <Field
            {...common('contact_person')}
            input={{ ...inputProps('contact_person'), type: 'text', autoComplete: 'name' }}
          />
          <Field
            {...common('phone')}
            input={{ ...inputProps('phone'), type: 'tel', inputMode: 'tel', autoComplete: 'tel' }}
          />
          <Field
            {...common('email')}
            input={{
              ...inputProps('email'),
              type: 'email',
              inputMode: 'email',
              autoComplete: 'email',
              autoCapitalize: 'none',
              spellCheck: false,
            }}
          />
        </div>

        <div className="mt-10">
          <button type="submit" className="btn-primary w-full sm:w-auto">
            {fromReview ? 'Back to review' : 'Continue'}
            <span className="btn-arrow">
              <ArrowRight aria-hidden="true" strokeWidth={1.5} className="h-4 w-4" />
            </span>
          </button>
        </div>
      </form>
    </>
  );
}
