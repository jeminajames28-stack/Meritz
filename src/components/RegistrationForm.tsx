import { AnimatePresence, motion } from 'framer-motion';
import {
  Store,
  Ticket,
  ClipboardCheck,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Edit3,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { SHOP_CATEGORIES, type TenantInput, type VoucherInput } from '@/lib/supabase';
import { fadeUpVariant, transition } from '@/lib/animations';

type Step = 'shop' | 'vouchers' | 'review' | 'confirmation';

type Props = {
  onSubmit: (tenant: TenantInput, vouchers: VoucherInput[]) => Promise<{ id: string }>;
};

const emptyTenant: TenantInput = {
  shop_name: '',
  unit_lot_number: '',
  category: '',
  contact_person: '',
  phone: '',
  email: '',
};

const emptyVoucher: VoucherInput = {
  title: '',
  discount_value: '',
  description: '',
  valid_from: '',
  valid_until: '',
  quantity: 1,
  terms: '',
};

const steps: { key: Step; label: string; icon: typeof Store }[] = [
  { key: 'shop', label: 'Shop Details', icon: Store },
  { key: 'vouchers', label: 'Vouchers', icon: Ticket },
  { key: 'review', label: 'Review', icon: ClipboardCheck },
  { key: 'confirmation', label: 'Done', icon: CheckCircle2 },
];

export default function RegistrationForm({ onSubmit }: Props) {
  const [step, setStep] = useState<Step>('shop');
  const [tenant, setTenant] = useState<TenantInput>(emptyTenant);
  const [vouchers, setVouchers] = useState<VoucherInput[]>([{ ...emptyVoucher }]);
  const [editingVoucher, setEditingVoucher] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [referenceId, setReferenceId] = useState('');

  const stepIndex = steps.findIndex((s) => s.key === step);

  function validateShop(): boolean {
    const e: Record<string, string> = {};
    if (!tenant.shop_name.trim()) e.shop_name = 'Shop name is required';
    if (!tenant.unit_lot_number.trim()) e.unit_lot_number = 'Unit/lot number is required';
    if (!tenant.category) e.category = 'Please select a category';
    if (!tenant.contact_person.trim()) e.contact_person = 'Contact person is required';
    if (!tenant.phone.trim()) e.phone = 'Phone number is required';
    else if (!/^[\d\s+\-()]{7,}$/.test(tenant.phone)) e.phone = 'Invalid phone number';
    if (!tenant.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tenant.email)) e.email = 'Invalid email address';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateVoucher(v: VoucherInput): Record<string, string> {
    const e: Record<string, string> = {};
    if (!v.title.trim()) e.title = 'Title is required';
    if (!v.discount_value.trim()) e.discount_value = 'Discount value is required';
    if (!v.description.trim()) e.description = 'Description is required';
    if (!v.valid_from) e.valid_from = 'Start date is required';
    if (!v.valid_until) e.valid_until = 'End date is required';
    if (v.valid_from && v.valid_until && v.valid_from > v.valid_until)
      e.valid_until = 'End date must be after start date';
    if (v.quantity < 1) e.quantity = 'Quantity must be at least 1';
    if (!v.terms.trim()) e.terms = 'Terms are required';
    return e;
  }

  function validateVouchers(): boolean {
    const allErrors: Record<string, string> = {};
    vouchers.forEach((v, i) => {
      const ve = validateVoucher(v);
      Object.entries(ve).forEach(([k, msg]) => {
        allErrors[`voucher_${i}_${k}`] = msg;
      });
    });
    setErrors(allErrors);
    return Object.keys(allErrors).length === 0;
  }

  function handleShopNext() {
    if (validateShop()) {
      setStep('vouchers');
      setErrors({});
    }
  }

  function handleVouchersNext() {
    if (validateVouchers()) {
      setStep('review');
      setErrors({});
    }
  }

  function handleBack() {
    if (step === 'vouchers') setStep('shop');
    else if (step === 'review') setStep('vouchers');
  }

  function updateVoucher(index: number, field: keyof VoucherInput, value: string | number) {
    setVouchers((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  }

  function addVoucher() {
    setVouchers((prev) => [...prev, { ...emptyVoucher }]);
    setEditingVoucher(null);
  }

  function removeVoucher(index: number) {
    if (vouchers.length === 1) return;
    setVouchers((prev) => prev.filter((_, i) => i !== index));
    setErrors({});
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError('');
    try {
      const result = await onSubmit(tenant, vouchers);
      setReferenceId(result.id);
      setStep('confirmation');
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleRegisterAnother() {
    setTenant(emptyTenant);
    setVouchers([{ ...emptyVoucher }]);
    setReferenceId('');
    setErrors({});
    setSubmitError('');
    setStep('shop');
  }

  function handleEditStep(target: Step) {
    setStep(target);
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-[#fff8fa] to-[#f8e9ee] py-12 md:py-20">
      <div className="max-w-3xl mx-auto px-6">
        {/* Progress bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-2">
            {steps.map((s, i) => {
              const isActive = i === stepIndex;
              const isComplete = i < stepIndex;
              return (
                <div key={s.key} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-br from-[#a20f43] to-[#7a1236] text-white scale-110 shadow-lg shadow-[#a20f43]/30'
                          : isComplete
                          ? 'bg-[#5a0d2a] text-white'
                          : 'bg-stone-200 text-stone-400'
                      }`}
                    >
                      <s.icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-xs font-medium hidden sm:block ${
                        isActive ? 'text-[#5a0d2a]' : isComplete ? 'text-stone-700' : 'text-stone-400'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 rounded transition-all duration-500 ${
                        isComplete ? 'bg-stone-900' : 'bg-stone-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'shop' && (
            <motion.div
              key="shop"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={transition}
            >
              <div className="bg-white rounded-3xl shadow-xl border border-stone-200/60 p-8 md:p-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#b1124a]/15 to-[#7a1236]/15 flex items-center justify-center">
                    <Store className="w-6 h-6 text-[#7a1236]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#5a0d2a]">Shop Information</h2>
                    <p className="text-sm text-stone-500">Tell us about your store</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field
                    label="Shop Name"
                    required
                    error={errors.shop_name}
                    value={tenant.shop_name}
                    onChange={(v) => setTenant({ ...tenant, shop_name: v })}
                    placeholder="e.g. My Beautiful Boutique"
                  />
                  <Field
                    label="Unit / Lot Number"
                    required
                    error={errors.unit_lot_number}
                    value={tenant.unit_lot_number}
                    onChange={(v) => setTenant({ ...tenant, unit_lot_number: v })}
                    placeholder="e.g. LG-28"
                  />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-stone-700">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={tenant.category}
                      onChange={(e) => setTenant({ ...tenant, category: e.target.value })}
                      className={`px-4 py-3 rounded-xl border bg-white text-[#5a0d2a] transition-colors ${
                        errors.category
                          ? 'border-red-400 focus:ring-red-400'
                          : 'border-stone-300 focus:ring-[#a20f43] focus:border-[#a20f43]'
                      } focus:ring-2 focus:outline-none`}
                    >
                      <option value="">Select a category...</option>
                      {SHOP_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <span className="text-xs text-rose-500">{errors.category}</span>
                    )}
                  </div>
                  <Field
                    label="Contact Person"
                    required
                    error={errors.contact_person}
                    value={tenant.contact_person}
                    onChange={(v) => setTenant({ ...tenant, contact_person: v })}
                    placeholder="e.g. John Tan"
                  />
                  <Field
                    label="Phone Number"
                    required
                    error={errors.phone}
                    value={tenant.phone}
                    onChange={(v) => setTenant({ ...tenant, phone: v })}
                    placeholder="e.g. +60 12 345 6789"
                  />
                  <Field
                    label="Email Address"
                    required
                    type="email"
                    error={errors.email}
                    value={tenant.email}
                    onChange={(v) => setTenant({ ...tenant, email: v })}
                    placeholder="e.g. shop@example.com"
                  />
                </div>

                <div className="flex justify-end mt-8">
                  <button
                    onClick={handleShopNext}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#5a0d2a] text-white font-medium hover:bg-[#7a1236] hover:scale-105 transition-all duration-300 shadow-lg"
                  >
                    Continue to Vouchers
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'vouchers' && (
            <motion.div
              key="vouchers"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={transition}
            >
              <div className="bg-white rounded-3xl shadow-xl border border-stone-200/60 p-8 md:p-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#b1124a]/15 to-[#7a1236]/15 flex items-center justify-center">
                    <Ticket className="w-6 h-6 text-[#7a1236]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#5a0d2a]">Voucher Offers</h2>
                    <p className="text-sm text-stone-500">Add your special anniversary vouchers</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {vouchers.map((voucher, index) => {
                    const isOpen = editingVoucher === null || editingVoucher === index;
                    const vErrors: Record<string, string> = {};
                    Object.entries(errors).forEach(([k, msg]) => {
                      if (k.startsWith(`voucher_${index}_`)) {
                        vErrors[k.replace(`voucher_${index}_`, '')] = msg;
                      }
                    });

                    return (
                      <div
                        key={index}
                        className="border border-stone-200 rounded-2xl overflow-hidden"
                      >
                        <div className="flex items-center justify-between px-5 py-3 bg-stone-50">
                          <span className="font-medium text-stone-800 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-[#a20f43] text-white text-xs font-bold flex items-center justify-center">
                              {index + 1}
                            </span>
                            {voucher.title || `Voucher ${index + 1}`}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingVoucher(isOpen ? null : index)}
                              className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-600 transition-colors"
                            >
                              {isOpen ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                            </button>
                            {vouchers.length > 1 && (
                              <button
                                onClick={() => removeVoucher(index)}
                                className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {isOpen && (
                          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field
                              label="Voucher Title"
                              required
                              error={vErrors.title}
                              value={voucher.title}
                              onChange={(v) => updateVoucher(index, 'title', v)}
                              placeholder="e.g. 30% Off Storewide"
                            />
                            <Field
                              label="Discount Value"
                              required
                              error={vErrors.discount_value}
                              value={voucher.discount_value}
                              onChange={(v) => updateVoucher(index, 'discount_value', v)}
                              placeholder="e.g. 30% off or RM50"
                            />
                            <div className="sm:col-span-2">
                              <Field
                                label="Description"
                                required
                                error={vErrors.description}
                                value={voucher.description}
                                onChange={(v) => updateVoucher(index, 'description', v)}
                                placeholder="Describe what this voucher offers..."
                              />
                            </div>
                            <Field
                              label="Valid From"
                              required
                              type="date"
                              error={vErrors.valid_from}
                              value={voucher.valid_from}
                              onChange={(v) => updateVoucher(index, 'valid_from', v)}
                            />
                            <Field
                              label="Valid Until"
                              required
                              type="date"
                              error={vErrors.valid_until}
                              value={voucher.valid_until}
                              onChange={(v) => updateVoucher(index, 'valid_until', v)}
                            />
                            <div className="flex flex-col gap-1.5">
                              <label className="text-sm font-medium text-stone-700">
                                Quantity <span className="text-rose-500">*</span>
                              </label>
                              <input
                                type="number"
                                min={1}
                                value={voucher.quantity}
                                onChange={(e) =>
                                  updateVoucher(index, 'quantity', parseInt(e.target.value) || 0)
                                }
                                className={`px-4 py-3 rounded-xl border bg-white text-[#5a0d2a] transition-colors ${
                                  vErrors.quantity
                                    ? 'border-red-400 focus:ring-red-400'
                                    : 'border-stone-300 focus:ring-[#a20f43] focus:border-[#a20f43]'
                                } focus:ring-2 focus:outline-none`}
                              />
                              {vErrors.quantity && (
                                <span className="text-xs text-rose-500">{vErrors.quantity}</span>
                              )}
                            </div>
                            <div className="sm:col-span-2">
                              <Field
                                label="Terms & Conditions"
                                required
                                error={vErrors.terms}
                                value={voucher.terms}
                                onChange={(v) => updateVoucher(index, 'terms', v)}
                                placeholder="e.g. Valid for minimum spend of RM100. Not valid with other promotions."
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={addVoucher}
                  className="mt-5 w-full py-3 rounded-xl border-2 border-dashed border-stone-300 text-stone-600 font-medium hover:border-[#a20f43] hover:text-[#7a1236] hover:bg-[#fff0f4] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Another Voucher
                </button>

                <div className="flex justify-between mt-8">
                  <button
                    onClick={handleBack}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-stone-100 text-stone-700 font-medium hover:bg-stone-200 transition-all duration-300"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                  </button>
                  <button
                    onClick={handleVouchersNext}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#5a0d2a] text-white font-medium hover:bg-[#7a1236] hover:scale-105 transition-all duration-300 shadow-lg"
                  >
                    Review Submission
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={transition}
            >
              <div className="bg-white rounded-3xl shadow-xl border border-stone-200/60 p-8 md:p-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#b1124a]/15 to-[#7a1236]/15 flex items-center justify-center">
                    <ClipboardCheck className="w-6 h-6 text-[#7a1236]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#5a0d2a]">Review Your Details</h2>
                    <p className="text-sm text-stone-500">Please confirm everything is correct</p>
                  </div>
                </div>

                {/* Shop details review */}
                <div className="rounded-2xl border border-stone-200 p-5 mb-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[#5a0d2a] flex items-center gap-2">
                      <Store className="w-5 h-5 text-[#7a1236]" />
                      Shop Information
                    </h3>
                    <button
                      onClick={() => handleEditStep('shop')}
                      className="text-sm text-[#7a1236] hover:text-blue-800 font-medium flex items-center gap-1"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <ReviewItem label="Shop Name" value={tenant.shop_name} />
                    <ReviewItem label="Unit / Lot" value={tenant.unit_lot_number} />
                    <ReviewItem label="Category" value={tenant.category} />
                    <ReviewItem label="Contact Person" value={tenant.contact_person} />
                    <ReviewItem label="Phone" value={tenant.phone} />
                    <ReviewItem label="Email" value={tenant.email} />
                  </div>
                </div>

                {/* Vouchers review */}
                <div className="rounded-2xl border border-stone-200 p-5 mb-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[#5a0d2a] flex items-center gap-2">
                      <Ticket className="w-5 h-5 text-[#7a1236]" />
                      Vouchers ({vouchers.length})
                    </h3>
                    <button
                      onClick={() => handleEditStep('vouchers')}
                      className="text-sm text-[#7a1236] hover:text-blue-800 font-medium flex items-center gap-1"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                  <div className="space-y-3">
                    {vouchers.map((v, i) => (
                      <div
                        key={i}
                        className="bg-gradient-to-br from-[#fff0f4] to-[#f8dce5] rounded-xl p-4 border border-[#edc5d2]"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs font-bold text-blue-800 uppercase tracking-wide">
                              Voucher {i + 1}
                            </span>
                            <h4 className="font-semibold text-[#5a0d2a] mt-0.5">{v.title}</h4>
                          </div>
                          <span className="px-3 py-1 rounded-full bg-[#a20f43] text-white text-sm font-bold">
                            {v.discount_value}
                          </span>
                        </div>
                        <p className="text-sm text-stone-600 mt-2">{v.description}</p>
                        <div className="flex flex-wrap gap-4 mt-3 text-xs text-stone-500">
                          <span>
                            <strong>Valid:</strong> {v.valid_from} → {v.valid_until}
                          </span>
                          <span>
                            <strong>Qty:</strong> {v.quantity}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-2">
                          <strong>Terms:</strong> {v.terms}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {submitError && (
                  <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                    {submitError}
                  </div>
                )}

                <div className="flex justify-between">
                  <button
                    onClick={handleBack}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-stone-100 text-stone-700 font-medium hover:bg-stone-200 transition-all duration-300"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold hover:scale-105 transition-all duration-300 shadow-lg shadow-[#a20f43]/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                  >
                    {submitting ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Submit Registration
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'confirmation' && (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={transition}
            >
              <div className="bg-white rounded-3xl shadow-xl border border-stone-200/60 p-8 md:p-12 text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#b1124a] to-[#7a1236] flex items-center justify-center mb-6 shadow-lg shadow-[#a20f43]/30"
                >
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </motion.div>

                <motion.h2
                  variants={fadeUpVariant}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.3, ...transition }}
                  className="text-3xl font-bold text-[#5a0d2a]"
                >
                  Registration Successful!
                </motion.h2>

                <motion.p
                  variants={fadeUpVariant}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.4, ...transition }}
                  className="mt-3 text-stone-600 max-w-md mx-auto"
                >
                  Thank you, {tenant.contact_person}! Your shop{' '}
                  <strong>{tenant.shop_name}</strong> and {vouchers.length} voucher
                  {vouchers.length > 1 ? 's' : ''} have been registered for Bintang Megamall's 30th
                  Anniversary Celebration.
                </motion.p>

                <motion.div
                  variants={fadeUpVariant}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.5, ...transition }}
                  className="mt-6 p-4 rounded-xl bg-stone-50 border border-stone-200 inline-block"
                >
                  <p className="text-xs text-stone-500 uppercase tracking-wide">Your Reference ID</p>
                  <p className="text-lg font-mono font-bold text-[#5a0d2a] mt-1">
                    {referenceId.slice(0, 8).toUpperCase()}
                  </p>
                </motion.div>

                <motion.div
                  variants={fadeUpVariant}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.6, ...transition }}
                  className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
                >
                  <button
                    onClick={handleRegisterAnother}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#5a0d2a] text-white font-medium hover:bg-[#7a1236] transition-all duration-300"
                  >
                    <Plus className="w-5 h-5" />
                    Register Another Shop
                  </button>
                  <a
                    href="https://bintangmegamall.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-stone-100 text-stone-700 font-medium hover:bg-stone-200 transition-all duration-300"
                  >
                    Visit Mall Website
                  </a>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function Field({
  label,
  required,
  error,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  required?: boolean;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-stone-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`px-4 py-3 rounded-xl border bg-white text-[#5a0d2a] placeholder:text-stone-400 transition-colors ${
          error
            ? 'border-red-400 focus:ring-red-400'
            : 'border-stone-300 focus:ring-[#a20f43] focus:border-[#a20f43]'
        } focus:ring-2 focus:outline-none`}
      />
      {error && <span className="text-xs text-rose-500">{error}</span>}
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-stone-400 text-xs uppercase tracking-wide">{label}</span>
      <p className="text-[#5a0d2a] font-medium mt-0.5">{value || '—'}</p>
    </div>
  );
}
