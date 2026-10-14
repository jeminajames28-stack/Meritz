import type { ChangeEvent } from 'react';
import { AlertCircle, ArrowRight, Plus } from 'lucide-react';
import Field from '@/components/ui/Field';
import VoucherTicket from '@/components/ui/VoucherTicket';
import { formatDateRange } from '@/lib/format';
import {
  ADD_VOUCHER_ID,
  HEADING_ID,
  voucherEditId,
  voucherFieldId,
  type VoucherForm,
} from './draft';
import {
  MAX_VOUCHERS,
  MESSAGES,
  VOUCHER_LABELS,
  errorCount,
  type VoucherErrors,
  type VoucherField,
} from './validation';

type Props = {
  shopName: string;
  vouchers: VoucherForm[];
  /** The one expanded voucher; null when all are collapsed. */
  activeId: string | null;
  errors: Record<string, VoucherErrors>;
  fromReview: boolean;
  /** 'YYYY-MM-DD' in Malaysia time. */
  today: string;
  onChange: (id: string, field: VoucherField, value: string) => void;
  onBlur: (id: string, field: VoucherField) => void;
  onAdd: () => void;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
  onBack: () => void;
  onContinue: () => void;
};

const ROW_BUTTON =
  'inline-flex min-h-11 items-center rounded-md px-4 text-[13px] font-medium uppercase tracking-[0.08em] ' +
  'text-brand-deep transition-colors hover:bg-brand-soft motion-reduce:transition-none';

const LIMIT_ID = 'voucher-limit';

function nameFor(index: number, voucher: VoucherForm): string {
  const title = voucher.title.trim();
  return title ? `voucher ${index + 1}: ${title}` : `voucher ${index + 1}`;
}

/** Step 2: one or more vouchers. One is open for editing; the others collapse to a row. */
export default function VoucherStep({
  shopName,
  vouchers,
  activeId,
  errors,
  fromReview,
  today,
  onChange,
  onBlur,
  onAdd,
  onEdit,
  onRemove,
  onBack,
  onContinue,
}: Props) {
  const canRemove = vouchers.length > 1;
  const atLimit = vouchers.length >= MAX_VOUCHERS;
  const preview = vouchers.find((voucher) => voucher.id === activeId) ?? vouchers[0];

  return (
    <>
      <h1 id={HEADING_ID} tabIndex={-1} className="h-section focus:outline-none">
        Your voucher
      </h1>

      {/* Phones: compact live preview. Desktop shows it in the side column instead. */}
      {preview && (
        <div aria-hidden="true" className="mt-6 lg:hidden">
          <VoucherTicket
            size="sm"
            shopName={shopName}
            value={preview.discount_value}
            detail={preview.title.trim() || undefined}
            meta={formatDateRange(preview.valid_from, preview.valid_until) || undefined}
            animateValue
          />
        </div>
      )}

      <form
        noValidate
        className="mt-10"
        onSubmit={(event) => {
          event.preventDefault();
          onContinue();
        }}
      >
        <ol className="space-y-4">
          {vouchers.map((voucher, index) => (
            <li key={voucher.id}>
              {voucher.id === activeId ? (
                <VoucherEditor
                  voucher={voucher}
                  index={index}
                  errors={errors[voucher.id] ?? {}}
                  today={today}
                  canRemove={canRemove}
                  onChange={onChange}
                  onBlur={onBlur}
                  onRemove={onRemove}
                />
              ) : (
                <VoucherRow
                  voucher={voucher}
                  index={index}
                  hasErrors={errorCount(errors[voucher.id] ?? {}) > 0}
                  canRemove={canRemove}
                  onEdit={onEdit}
                  onRemove={onRemove}
                />
              )}
            </li>
          ))}
        </ol>

        <div className="mt-6">
          <button
            type="button"
            id={ADD_VOUCHER_ID}
            onClick={onAdd}
            disabled={atLimit}
            aria-describedby={atLimit ? LIMIT_ID : undefined}
            className="btn w-full border border-dashed border-brand-input-border text-brand-deep hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent"
          >
            <Plus aria-hidden="true" strokeWidth={1.5} className="h-4 w-4" />
            Add another voucher
          </button>
          {atLimit && (
            <p id={LIMIT_ID} className="mt-2 text-sm text-brand-muted">
              {MESSAGES.tooManyVouchers}
            </p>
          )}
        </div>

        <div className="mt-10 flex gap-4">
          <button type="button" onClick={onBack} className="btn-outline">
            Back
          </button>
          <button type="submit" className="btn-primary flex-1 sm:flex-none">
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

type EditorProps = {
  voucher: VoucherForm;
  index: number;
  errors: VoucherErrors;
  today: string;
  canRemove: boolean;
  onChange: Props['onChange'];
  onBlur: Props['onBlur'];
  onRemove: Props['onRemove'];
};

function VoucherEditor({ voucher, index, errors, today, canRemove, onChange, onBlur, onRemove }: EditorProps) {
  const headingId = `voucher-${voucher.id}-heading`;
  // The end date can't be before today or before the start date.
  const untilMin = voucher.valid_from > today ? voucher.valid_from : today;

  const common = (field: VoucherField) => ({
    label: VOUCHER_LABELS[field],
    id: voucherFieldId(voucher.id, field),
    error: errors[field],
    required: true,
  });

  const controlProps = (field: VoucherField) => ({
    name: field,
    value: voucher[field],
    autoComplete: 'off',
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(voucher.id, field, event.target.value),
    onBlur: () => onBlur(voucher.id, field),
  });

  return (
    <div
      role="group"
      aria-labelledby={headingId}
      className="rounded-[10px] border border-brand-line bg-white p-4 lg:p-6"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 id={headingId} className="font-serif text-2xl leading-tight text-brand-deep">
          Voucher {index + 1}
        </h2>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(voucher.id)}
            aria-label={`Remove ${nameFor(index, voucher)}`}
            className={ROW_BUTTON}
          >
            Remove
          </button>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Field
          {...common('title')}
          hint="e.g. 30% off storewide"
          input={{ ...controlProps('title'), type: 'text' }}
        />
        <Field
          {...common('discount_value')}
          hint={'"30%" or "RM50"'}
          input={{ ...controlProps('discount_value'), type: 'text' }}
        />
        <Field
          {...common('description')}
          className="lg:col-span-2"
          textarea={{ ...controlProps('description'), rows: 3 }}
        />
        <Field {...common('valid_from')} input={{ ...controlProps('valid_from'), type: 'date' }} />
        <Field
          {...common('valid_until')}
          input={{ ...controlProps('valid_until'), type: 'date', min: untilMin }}
        />
        <Field
          {...common('quantity')}
          input={{ ...controlProps('quantity'), type: 'text', inputMode: 'numeric', pattern: '[0-9]*' }}
        />
        <Field {...common('terms')} className="lg:col-span-2" textarea={{ ...controlProps('terms'), rows: 3 }} />
      </div>
    </div>
  );
}

type RowProps = {
  voucher: VoucherForm;
  index: number;
  hasErrors: boolean;
  canRemove: boolean;
  onEdit: Props['onEdit'];
  onRemove: Props['onRemove'];
};

function VoucherRow({ voucher, index, hasErrors, canRemove, onEdit, onRemove }: RowProps) {
  const title = voucher.title.trim();
  const value = voucher.discount_value.trim();
  const name = nameFor(index, voucher);

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[10px] border border-brand-line bg-white px-4 py-2">
      <div className="min-w-0 flex-1 py-2">
        <p className="label text-brand-muted">Voucher {index + 1}</p>
        {title && <p className="mt-2 truncate text-base text-brand-ink">{title}</p>}
        {hasErrors && (
          <p className="mt-2 flex items-center gap-2 text-sm text-brand-error">
            <AlertCircle aria-hidden="true" strokeWidth={1.5} className="h-4 w-4 shrink-0" />
            Needs attention
          </p>
        )}
      </div>
      {value && (
        <span className="max-w-[40%] truncate font-serif text-2xl leading-none text-brand-primary">{value}</span>
      )}
      <div className="flex">
        <button
          type="button"
          id={voucherEditId(voucher.id)}
          onClick={() => onEdit(voucher.id)}
          aria-label={`Edit ${name}`}
          className={ROW_BUTTON}
        >
          Edit
        </button>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(voucher.id)}
            aria-label={`Remove ${name}`}
            className={ROW_BUTTON}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
