import { useEffect, useRef, useState } from 'react';
import LogoLockup from '@/components/ui/LogoLockup';
import VoucherTicket from '@/components/ui/VoucherTicket';
import { formatDateRange, todayInMalaysia } from '@/lib/format';
import { DURATION, EASE, MOTION_QUERIES, gsap, useGSAP } from '@/lib/motion';
import { registerTenant } from '@/lib/registerTenant';
import type { VoucherInput } from '@/lib/supabase';
import DoneScreen from './DoneScreen';
import Progress from './Progress';
import ReviewStep from './ReviewStep';
import ShopStep from './ShopStep';
import VoucherStep from './VoucherStep';
import {
  ADD_VOUCHER_ID,
  HEADING_ID,
  SEND_ERROR_ID,
  clearDraft,
  emptyTenant,
  emptyVoucher,
  hasContent,
  loadDraft,
  saveDraft,
  tenantFieldId,
  voucherEditId,
  voucherFieldId,
  type Step,
  type TenantForm,
  type VoucherForm,
} from './draft';
import {
  MAX_VOUCHERS,
  TENANT_FIELDS,
  TENANT_LABELS,
  VOUCHER_FIELDS,
  VOUCHER_LABELS,
  errorCount,
  validateAll,
  validateTenant,
  validateTenantField,
  validateVoucher,
  type TenantErrors,
  type TenantField,
  type VoucherErrors,
  type VoucherField,
} from './validation';

type Props = {
  onExit: () => void;
};

type FlowStep = Step | 'done';

type Submitted = {
  id: string;
  contactName: string;
  shopName: string;
  vouchers: VoucherForm[];
};

const STEP_LABELS: Record<Step, string> = {
  1: 'Shop details',
  2: 'Your voucher',
  3: 'Review & send',
};

/** brand.blush: the preview panel colour, so the ticket notches look cut out. */
const BLUSH = '#f8e9ee';
const SAVE_DELAY_MS = 300;
const FALLBACK_SEND_ERROR = "Couldn't send. Check your connection and try again.";
const RESTORED_NOTE = 'We kept your unfinished registration.';

function initialState() {
  const draft = loadDraft();
  if (draft && hasContent(draft.tenant, draft.vouchers)) {
    return {
      tenant: draft.tenant,
      vouchers: draft.vouchers,
      step: draft.step as FlowStep,
      activeId: draft.vouchers[draft.vouchers.length - 1].id,
      restored: true,
    };
  }
  const voucher = emptyVoucher();
  return { tenant: emptyTenant(), vouchers: [voucher], step: 1 as FlowStep, activeId: voucher.id, restored: false };
}

function attentionMessage(count: number): string {
  return count === 1 ? '1 field needs attention' : `${count} fields need attention`;
}

/** Text read out when a field error appears on blur. Adds the label when the message does not name the field. */
function fieldErrorText(label: string, message: string): string {
  return message.startsWith(label) ? message : `${label}: ${message}`;
}

function toVoucherInput(voucher: VoucherForm): VoucherInput {
  return {
    title: voucher.title,
    discount_value: voucher.discount_value,
    description: voucher.description,
    valid_from: voucher.valid_from,
    valid_until: voucher.valid_until,
    quantity: Number(voucher.quantity.trim()),
    terms: voucher.terms,
  };
}

/** Validates every voucher; returns all errors, their total and the first failing field. */
function checkVouchers(vouchers: readonly VoucherForm[], today: string) {
  const errors: Record<string, VoucherErrors> = {};
  let total = 0;
  let first: { id: string; field: VoucherField } | null = null;
  for (const voucher of vouchers) {
    const voucherErrors = validateVoucher(voucher, today);
    errors[voucher.id] = voucherErrors;
    total += errorCount(voucherErrors);
    const field = VOUCHER_FIELDS.find((key) => voucherErrors[key]);
    if (!first && field) first = { id: voucher.id, field };
  }
  return { errors, total, first };
}

/** The registration screen: shop details, vouchers, review, send and confirmation. */
export default function RegistrationFlow({ onExit }: Props) {
  const [initial] = useState(initialState);
  const [tenant, setTenant] = useState<TenantForm>(initial.tenant);
  const [vouchers, setVouchers] = useState<VoucherForm[]>(initial.vouchers);
  const [step, setStep] = useState<FlowStep>(initial.step);
  const [activeId, setActiveId] = useState<string | null>(initial.activeId);
  const [restored, setRestored] = useState(initial.restored);
  const [fromReview, setFromReview] = useState(false);
  const [tenantErrors, setTenantErrors] = useState<TenantErrors>({});
  const [voucherErrors, setVoucherErrors] = useState<Record<string, VoucherErrors>>({});
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<Submitted | null>(null);
  const [announcement, setAnnouncement] = useState({ text: '', key: 0 });
  const [focusRequest, setFocusRequest] = useState({ id: HEADING_ID, key: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef<HTMLDivElement>(null);
  const sendingRef = useRef(false);
  const mounted = useRef(false);
  // Fields the visitor has typed in, so leaving an untouched empty field shows no error.
  const touched = useRef(new Set<string>());
  // The debounced draft save that has not run yet.
  const pendingSave = useRef<(() => void) | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // The restored note sits above the heading that takes focus, so screen readers hear it here.
  useEffect(() => {
    if (initial.restored) setAnnouncement((prev) => ({ text: RESTORED_NOTE, key: prev.key + 1 }));
  }, [initial.restored]);

  // Focus moves after the render that shows the target: the step heading, or a field with an error.
  useEffect(() => {
    const target = document.getElementById(focusRequest.id);
    if (!target) return;
    if (focusRequest.id === HEADING_ID) {
      window.scrollTo(0, 0);
      target.focus({ preventScroll: true });
    } else {
      target.focus();
    }
  }, [focusRequest]);

  // Save the draft 300 ms after the last change. Never on the Done screen.
  useEffect(() => {
    if (step === 'done') {
      pendingSave.current = null;
      return;
    }
    const save = () => {
      if (pendingSave.current !== save) return;
      pendingSave.current = null;
      if (hasContent(tenant, vouchers)) saveDraft({ tenant, vouchers, step });
      else clearDraft();
    };
    pendingSave.current = save;
    const timer = window.setTimeout(save, SAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [tenant, vouchers, step]);

  // Leaving the screen (system Back, reload, closing the tab) saves at once.
  useEffect(() => {
    const flush = () => pendingSave.current?.();
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, []);

  useGSAP(
    () => {
      const el = stepRef.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      const enter = (duration: number) =>
        gsap.from(el, { x: 12, opacity: 0, duration, ease: EASE.enter, clearProps: 'transform,opacity' });
      mm.add(MOTION_QUERIES.desktop, () => {
        enter(DURATION.fast);
      });
      mm.add(MOTION_QUERIES.phone, () => {
        enter(DURATION.fast * 0.7);
      });
      return () => mm.revert();
    },
    { scope: containerRef, dependencies: [step], revertOnUpdate: true },
  );

  const requestFocus = (id: string) => setFocusRequest((prev) => ({ id, key: prev.key + 1 }));
  const announce = (text: string) => setAnnouncement((prev) => ({ text, key: prev.key + 1 }));

  function goToStep(next: FlowStep, focusId: string = HEADING_ID) {
    setStep(next);
    setRestored(false);
    setSendError(null);
    setAnnouncement((prev) => ({ text: '', key: prev.key + 1 }));
    if (next === 3) setFromReview(false);
    requestFocus(focusId);
  }

  function resetForm() {
    if (sendingRef.current) return;
    pendingSave.current = null;
    clearDraft();
    const voucher = emptyVoucher();
    touched.current.clear();
    setTenant(emptyTenant());
    setVouchers([voucher]);
    setActiveId(voucher.id);
    setTenantErrors({});
    setVoucherErrors({});
    setFromReview(false);
    setSubmitted(null);
    goToStep(1);
  }

  // Shop details

  function handleTenantChange(field: TenantField, value: string) {
    touched.current.add(`tenant:${field}`);
    setTenant((prev) => ({ ...prev, [field]: value }));
    // A shown error follows the typing; a new one waits for blur or Continue.
    setTenantErrors((prev) => (prev[field] ? { ...prev, [field]: validateTenantField(field, value) } : prev));
  }

  function handleTenantBlur(field: TenantField) {
    const untouchedEmpty = !tenant[field].trim() && !touched.current.has(`tenant:${field}`);
    if (untouchedEmpty && !tenantErrors[field]) return;
    const message = validateTenantField(field, tenant[field]);
    if (message && message !== tenantErrors[field]) announce(fieldErrorText(TENANT_LABELS[field], message));
    setTenantErrors((prev) => ({ ...prev, [field]: message }));
  }

  function handleShopContinue() {
    const errors = validateTenant(tenant);
    setTenantErrors(errors);
    const first = TENANT_FIELDS.find((field) => errors[field]);
    if (first) {
      announce(attentionMessage(errorCount(errors)));
      requestFocus(tenantFieldId(first));
      return;
    }
    goToStep(fromReview ? 3 : 2);
  }

  // Vouchers

  /** Re-checks the given fields of one voucher and returns all of its current errors. */
  function refreshVoucherErrors(voucher: VoucherForm, fields: VoucherField[]): VoucherErrors {
    if (!fields.length) return {};
    const all = validateVoucher(voucher, todayInMalaysia());
    setVoucherErrors((prev) => {
      const current = { ...(prev[voucher.id] ?? {}) };
      for (const field of fields) current[field] = all[field];
      return { ...prev, [voucher.id]: current };
    });
    return all;
  }

  function handleVoucherChange(id: string, field: VoucherField, value: string) {
    touched.current.add(`${id}:${field}`);
    setVouchers((prev) => prev.map((voucher) => (voucher.id === id ? { ...voucher, [field]: value } : voucher)));
    const current = vouchers.find((voucher) => voucher.id === id);
    if (!current) return;
    const shown = voucherErrors[id] ?? {};
    const recheck: VoucherField[] = [];
    if (shown[field]) recheck.push(field);
    if (field === 'valid_from' && shown.valid_until) recheck.push('valid_until');
    refreshVoucherErrors({ ...current, [field]: value }, recheck);
  }

  function handleVoucherBlur(id: string, field: VoucherField) {
    const voucher = vouchers.find((item) => item.id === id);
    if (!voucher) return;
    const shown = voucherErrors[id] ?? {};
    const recheck: VoucherField[] = [];
    const untouchedEmpty = !voucher[field].trim() && !touched.current.has(`${id}:${field}`);
    if (!untouchedEmpty || shown[field]) recheck.push(field);
    // A new start date can make the end date valid or invalid.
    if (field === 'valid_from' && (voucher.valid_until || shown.valid_until)) recheck.push('valid_until');
    const all = refreshVoucherErrors(voucher, recheck);
    const appeared = recheck.filter((key) => all[key] && all[key] !== shown[key]);
    if (appeared.length) {
      announce(appeared.map((key) => fieldErrorText(VOUCHER_LABELS[key], all[key] ?? '')).join('. '));
    }
  }

  function handleAddVoucher() {
    if (vouchers.length >= MAX_VOUCHERS) return;
    const voucher = emptyVoucher();
    setVouchers((prev) => [...prev, voucher]);
    setActiveId(voucher.id);
    requestFocus(voucherFieldId(voucher.id, 'title'));
  }

  function handleEditVoucher(id: string) {
    setActiveId(id);
    requestFocus(voucherFieldId(id, 'title'));
  }

  function handleRemoveVoucher(id: string) {
    const index = vouchers.findIndex((voucher) => voucher.id === id);
    if (vouchers.length <= 1 || index < 0) return;
    const next = vouchers.filter((voucher) => voucher.id !== id);
    // A single remaining voucher is always open; otherwise removing the open one closes all.
    const nextActive = next.length === 1 ? next[0].id : activeId === id ? null : activeId;
    setVouchers(next);
    setActiveId(nextActive);
    setVoucherErrors((prev) => {
      const rest = { ...prev };
      delete rest[id];
      return rest;
    });
    // Focus the voucher that moved into its place: its first field when it is open, else its Edit button.
    const following = next[index];
    if (!following) requestFocus(ADD_VOUCHER_ID);
    else if (following.id === nextActive) requestFocus(voucherFieldId(following.id, 'title'));
    else requestFocus(voucherEditId(following.id));
    announce('Voucher removed');
  }

  function handleVoucherContinue() {
    const { errors, total, first } = checkVouchers(vouchers, todayInMalaysia());
    setVoucherErrors(errors);
    if (first) {
      setActiveId(first.id);
      announce(attentionMessage(total));
      requestFocus(voucherFieldId(first.id, first.field));
      return;
    }
    goToStep(3);
  }

  // Review and send

  function editFromReview(target: 1 | 2, voucherId?: string) {
    if (voucherId) setActiveId(voucherId);
    goToStep(target);
    setFromReview(true);
  }

  async function handleSend() {
    if (sendingRef.current) return;
    const today = todayInMalaysia();
    const failure = validateAll(tenant, vouchers, today);
    if (failure) {
      if (failure.step === 1) {
        const errors = validateTenant(tenant);
        setTenantErrors(errors);
        goToStep(1, tenantFieldId(failure.field));
        announce(attentionMessage(errorCount(errors)));
      } else if (failure.field === 'vouchers') {
        goToStep(2, ADD_VOUCHER_ID);
        announce(failure.message);
      } else {
        const { errors, total } = checkVouchers(vouchers, today);
        const voucherId = vouchers[failure.voucherIndex].id;
        setVoucherErrors(errors);
        setActiveId(voucherId);
        goToStep(2, voucherFieldId(voucherId, failure.field));
        announce(attentionMessage(total));
      }
      setFromReview(true);
      return;
    }

    sendingRef.current = true;
    setSending(true);
    setSendError(null);
    announce('Sending registration');
    try {
      const { id } = await registerTenant(tenant, vouchers.map(toVoucherInput));
      // Sent, so the draft goes even if the visitor has already left this screen.
      pendingSave.current = null;
      clearDraft();
      if (!mounted.current) return;
      setSubmitted({ id, contactName: tenant.contact_person, shopName: tenant.shop_name, vouchers });
      goToStep('done');
    } catch (error) {
      if (!mounted.current) return;
      setSendError(error instanceof Error && error.message ? error.message : FALLBACK_SEND_ERROR);
      requestFocus(SEND_ERROR_ID);
    } finally {
      sendingRef.current = false;
      if (mounted.current) setSending(false);
    }
  }

  function handleBack() {
    if (sendingRef.current) return;
    if (step === 1) onExit();
    else if (step === 2) goToStep(1);
    else if (step === 3) goToStep(2);
  }

  const previewVoucher = vouchers.find((voucher) => voucher.id === activeId) ?? vouchers[0];
  const showPreview = step === 1 || step === 2;

  let content;
  if (step === 1) {
    content = (
      <ShopStep
        tenant={tenant}
        errors={tenantErrors}
        fromReview={fromReview}
        onChange={handleTenantChange}
        onBlur={handleTenantBlur}
        onContinue={handleShopContinue}
      />
    );
  } else if (step === 2) {
    content = (
      <VoucherStep
        shopName={tenant.shop_name}
        vouchers={vouchers}
        activeId={activeId}
        errors={voucherErrors}
        fromReview={fromReview}
        today={todayInMalaysia()}
        onChange={handleVoucherChange}
        onBlur={handleVoucherBlur}
        onAdd={handleAddVoucher}
        onEdit={handleEditVoucher}
        onRemove={handleRemoveVoucher}
        onBack={() => goToStep(1)}
        onContinue={handleVoucherContinue}
      />
    );
  } else if (step === 3) {
    content = (
      <ReviewStep
        tenant={tenant}
        vouchers={vouchers}
        sending={sending}
        sendError={sendError}
        onEditTenant={() => editFromReview(1)}
        onEditVoucher={(id) => editFromReview(2, id)}
        onBack={() => goToStep(2)}
        onSend={handleSend}
      />
    );
  } else if (submitted) {
    content = (
      <DoneScreen
        referenceId={submitted.id}
        contactName={submitted.contactName}
        shopName={submitted.shopName}
        vouchers={submitted.vouchers}
        onRegisterAnother={resetForm}
        onExit={onExit}
      />
    );
  }

  return (
    <div ref={containerRef} className="min-h-svh overflow-x-clip bg-brand-surface">
      <header className="page flex items-center justify-between gap-4 pt-6 lg:pt-10">
        <LogoLockup size="sm" />
        {step !== 'done' && (
          <button
            type="button"
            onClick={handleBack}
            disabled={sending}
            className="text-link disabled:cursor-not-allowed disabled:opacity-60"
          >
            {step === 1 ? 'Back to page' : 'Back'}
          </button>
        )}
      </header>

      <main id="main" className="page pb-16 pt-10">
        {step !== 'done' && <Progress current={step} label={STEP_LABELS[step]} />}

        {restored && step !== 'done' && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-x-4 rounded-md bg-brand-soft px-4 py-2">
            <p className="py-2 text-sm text-brand-ink">{RESTORED_NOTE}</p>
            <button
              type="button"
              onClick={resetForm}
              disabled={sending}
              className="inline-flex min-h-11 items-center text-[13px] font-medium uppercase tracking-[0.08em] text-brand-primary underline decoration-1 underline-offset-4 hover:text-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              Start over
            </button>
          </div>
        )}

        <div className={`mt-10 grid gap-10 ${showPreview ? 'lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16' : ''}`}>
          <div key={String(step)} ref={stepRef} className="min-w-0">
            {content}
          </div>

          {showPreview && previewVoucher && (
            <div aria-hidden="true" className="hidden lg:block">
              <div className="sticky top-10 rounded-[12px] bg-brand-blush p-6">
                <p className="label text-brand-muted">Your voucher, as shoppers see it</p>
                <VoucherTicket
                  className="mt-4"
                  shopName={tenant.shop_name}
                  value={previewVoucher.discount_value}
                  detail={previewVoucher.title.trim() || undefined}
                  meta={formatDateRange(previewVoucher.valid_from, previewVoucher.valid_until) || undefined}
                  notch={BLUSH}
                  animateValue
                />
                <p className="mt-4 text-sm text-brand-muted">Shown on screens and posters across Bintang Megamall.</p>
              </div>
            </div>
          )}
        </div>

        <div role="status" aria-live="polite" className="sr-only">
          <span key={announcement.key}>{announcement.text}</span>
        </div>
      </main>
    </div>
  );
}
