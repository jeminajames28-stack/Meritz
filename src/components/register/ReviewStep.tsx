import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import VoucherTicket from '@/components/ui/VoucherTicket';
import { formatDateRange } from '@/lib/format';
import { HEADING_ID, SEND_ERROR_ID, type TenantForm, type VoucherForm } from './draft';
import { TENANT_FIELDS, TENANT_LABELS } from './validation';

type Props = {
  tenant: TenantForm;
  vouchers: VoucherForm[];
  sending: boolean;
  sendError: string | null;
  onEditTenant: () => void;
  onEditVoucher: (id: string) => void;
  onBack: () => void;
  onSend: () => void;
};

const EDIT_BUTTON =
  'inline-flex min-h-11 items-center rounded-md px-4 text-[13px] font-medium uppercase tracking-[0.08em] ' +
  'text-brand-deep transition-colors hover:bg-brand-soft motion-reduce:transition-none ' +
  'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent';

function voucherMeta(voucher: VoucherForm): string {
  return [formatDateRange(voucher.valid_from, voucher.valid_until), `Qty ${voucher.quantity.trim()}`]
    .filter(Boolean)
    .join(' · ');
}

/** Step 3: everything at a glance, with a way back to each part, then send. */
export default function ReviewStep({
  tenant,
  vouchers,
  sending,
  sendError,
  onEditTenant,
  onEditVoucher,
  onBack,
  onSend,
}: Props) {
  return (
    <>
      <h1 id={HEADING_ID} tabIndex={-1} className="h-section focus:outline-none">
        Review &amp; send
      </h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <section aria-labelledby="review-shop">
          <div className="flex items-center justify-between gap-4 border-b border-brand-line pb-2">
            <h2 id="review-shop" className="font-serif text-2xl leading-tight text-brand-deep">
              Shop details
            </h2>
            <button
              type="button"
              onClick={onEditTenant}
              disabled={sending}
              aria-label="Edit shop details"
              className={EDIT_BUTTON}
            >
              Edit
            </button>
          </div>
          <dl className="divide-y divide-brand-line">
            {TENANT_FIELDS.map((field) => (
              <div key={field} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 py-4">
                <dt className="text-sm text-brand-muted">{TENANT_LABELS[field]}</dt>
                <dd className="break-words text-brand-ink">{tenant[field].trim()}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="review-vouchers">
          <h2
            id="review-vouchers"
            className="border-b border-brand-line pb-2 font-serif text-2xl leading-tight text-brand-deep"
          >
            {vouchers.length === 1 ? 'Voucher' : `Vouchers (${vouchers.length})`}
          </h2>
          <ol className="mt-6 space-y-10">
            {vouchers.map((voucher, index) => {
              const title = voucher.title.trim();
              return (
                <li key={voucher.id}>
                  <VoucherTicket
                    shopName={tenant.shop_name}
                    detail={title}
                    value={voucher.discount_value}
                    meta={voucherMeta(voucher)}
                  />
                  <div className="mt-4 space-y-2 text-sm text-brand-muted">
                    <p className="whitespace-pre-line break-words">{voucher.description.trim()}</p>
                    <p className="whitespace-pre-line break-words">Terms: {voucher.terms.trim()}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onEditVoucher(voucher.id)}
                    disabled={sending}
                    aria-label={`Edit voucher ${index + 1}${title ? `: ${title}` : ''}`}
                    className={`${EDIT_BUTTON} mt-2 -ml-4`}
                  >
                    Edit
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      </div>

      {sendError && (
        <div
          id={SEND_ERROR_ID}
          role="alert"
          tabIndex={-1}
          className="mt-10 flex gap-2 rounded-md bg-brand-error-soft px-4 py-4 text-brand-error focus:outline-none"
        >
          <span className="flex h-6 shrink-0 items-center">
            <AlertCircle aria-hidden="true" strokeWidth={1.5} className="h-5 w-5" />
          </span>
          <p>{sendError}</p>
        </div>
      )}

      <div className="mt-10 flex gap-4">
        <button type="button" onClick={onBack} disabled={sending} className="btn-outline disabled:opacity-60">
          Back
        </button>
        <button
          type="button"
          onClick={onSend}
          disabled={sending}
          aria-busy={sending}
          className="btn-primary flex-1 disabled:cursor-wait sm:flex-none"
        >
          {sending && (
            <Loader2 aria-hidden="true" strokeWidth={1.5} className="h-4 w-4 animate-spin motion-reduce:animate-none" />
          )}
          Send registration
          {!sending && (
            <span className="btn-arrow">
              <ArrowRight aria-hidden="true" strokeWidth={1.5} className="h-4 w-4" />
            </span>
          )}
        </button>
      </div>
    </>
  );
}
