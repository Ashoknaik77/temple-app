import { useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLang } from '../../i18n';
import {
  currentAdmin,
  getExpense,
  getExpenseCategories,
  saveExpense,
} from '../../data/mock';
import type { ExpensePaymentMode } from '../../types';
import { downscaleImage, scanReceipt } from '../../lib/receiptOcr';
import { ScreenHeader } from '../../components/ScreenHeader';
import { toISODate } from '../../components/text';

const MODES: ExpensePaymentMode[] = ['Cash', 'UPI', 'Bank', 'Cheque', 'Card'];

const inputCls =
  'mt-1 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 focus:border-amber-600 focus:outline-none';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-bold text-stone-800">
      {label}
      {children}
    </label>
  );
}

/** Admin: add or edit an expense, with free on-device receipt OCR. */
export function AdminExpenseFormScreen() {
  const { t } = useLang();
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const existing = isNew ? null : getExpense(id as string);

  const categories = useMemo(() => getExpenseCategories(), []);
  const [date, setDate] = useState(existing?.date ?? toISODate(new Date()));
  const [categoryId, setCategoryId] = useState(
    existing?.categoryId ?? categories.find((c) => c.name === 'Pooja Materials')?.id ?? '',
  );
  const [amount, setAmount] = useState(existing ? String(existing.amount) : '');
  const [mode, setMode] = useState<ExpensePaymentMode>(existing?.paymentMode ?? 'Cash');
  const [paidTo, setPaidTo] = useState(existing?.paidTo ?? '');
  const [vendorPhone, setVendorPhone] = useState(existing?.vendorPhone ?? '');
  const [invoiceNo, setInvoiceNo] = useState(existing?.invoiceNo ?? '');
  const [note, setNote] = useState(existing?.note ?? '');
  const [customNote, setCustomNote] = useState(existing?.customNote ?? '');
  const [receipt, setReceipt] = useState<string | undefined>(existing?.receiptDataUrl);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanPct, setScanPct] = useState(0);
  const [scanNote, setScanNote] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const isOther =
    categories.find((c) => c.id === categoryId)?.name.toLowerCase() === 'other';

  if (!isNew && !existing) {
    return (
      <div className="pb-24">
        <ScreenHeader title={t('expenses')} backTo="/admin/expenses" />
        <p className="px-4 pt-8 text-center text-stone-500">{t('tryAgain')}</p>
      </div>
    );
  }

  async function onPickReceipt(file: File) {
    setError('');
    setScanNote('');
    try {
      const dataUrl = await downscaleImage(file);
      setReceipt(dataUrl);
      setScanning(true);
      setScanPct(0);
      const scan = await scanReceipt(dataUrl, setScanPct);
      // Pre-fill for admin review — OCR is an assist, not an authority.
      if (scan.amount) setAmount(String(Math.round(scan.amount)));
      if (scan.date) setDate(scan.date);
      if (scan.vendor && !paidTo) setPaidTo(scan.vendor);
      if (scan.invoiceNo && !invoiceNo) setInvoiceNo(scan.invoiceNo);
      const found = [
        scan.amount ? t('ocrFoundAmount') : null,
        scan.date ? t('ocrFoundDate') : null,
        scan.vendor ? t('ocrFoundVendor') : null,
        scan.invoiceNo ? t('ocrFoundBill') : null,
      ].filter(Boolean);
      setScanNote(
        found.length > 0
          ? `${t('ocrExtracted')}: ${found.join(', ')} (${t('ocrReview')})`
          : t('ocrNothingFound'),
      );
    } catch {
      setError(t('ocrFailed'));
    } finally {
      setScanning(false);
    }
  }

  async function submit() {
    if (saving || scanning) return;
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      setError(t('invalidAmount'));
      return;
    }
    if (!paidTo.trim()) {
      setError(t('paidToRequired'));
      return;
    }
    if (isOther && !customNote.trim()) {
      setError(t('customNoteRequired'));
      return;
    }
    setSaving(true);
    setError('');
    try {
      await saveExpense(
        {
          id: existing?.id,
          date,
          categoryId,
          amount: amt,
          paymentMode: mode,
          paidTo: paidTo.trim(),
          vendorPhone: vendorPhone.trim() || undefined,
          invoiceNo: invoiceNo.trim() || undefined,
          note: note.trim() || undefined,
          receiptDataUrl: receipt,
          customNote: customNote.trim() || undefined,
        },
        currentAdmin()?.name,
      );
      navigate('/admin/expenses', { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : t('tryAgain'));
      setSaving(false);
    }
  }

  return (
    <div className="pb-24">
      <ScreenHeader title={isNew ? t('addExpense') : t('editExpense')} backTo="/admin/expenses" />
      <div className="space-y-4 px-4 pt-3">
        {/* Scan receipt */}
        <div className="rounded-2xl bg-amber-50 p-4">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            aria-label={t('scanReceipt')}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onPickReceipt(f);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            disabled={scanning}
            onClick={() => fileRef.current?.click()}
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-amber-700 text-base font-extrabold text-white disabled:opacity-60"
          >
            <span aria-hidden>📷</span>
            {scanning ? `${t('scanning')} ${scanPct}%` : t('scanReceipt')}
          </button>
          {scanning && (
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-amber-100">
              <div
                className="h-full rounded-full bg-amber-600 transition-all"
                style={{ width: `${scanPct}%` }}
              />
            </div>
          )}
          {scanNote && <p className="mt-2 text-xs font-semibold text-stone-600">{scanNote}</p>}
          {receipt && (
            <img
              src={receipt}
              alt=""
              className="mt-2 h-28 w-full rounded-xl object-cover"
              loading="lazy"
            />
          )}
        </div>

        <Field label={t('date')}>
          <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>

        <Field label={t('category')}>
          <select className={inputCls} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        {isOther && (
          <Field label={`${t('customNote')} *`}>
            <input
              className={inputCls}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder={t('customNotePlaceholder')}
            />
          </Field>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label={`${t('amount')} (₹)`}>
            <input
              className={inputCls}
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))}
              placeholder="0"
            />
          </Field>
          <Field label={t('paymentMode')}>
            <select className={inputCls} value={mode} onChange={(e) => setMode(e.target.value as ExpensePaymentMode)}>
              {MODES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label={`${t('paidTo')} *`}>
          <input
            className={inputCls}
            value={paidTo}
            onChange={(e) => setPaidTo(e.target.value)}
            placeholder={t('paidToPlaceholder')}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t('vendorPhoneOptional')}>
            <input
              className={inputCls}
              inputMode="tel"
              value={vendorPhone}
              onChange={(e) => setVendorPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="98765 43210"
            />
          </Field>
          <Field label={t('invoiceNoOptional')}>
            <input
              className={inputCls}
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
              placeholder="BILL-123"
            />
          </Field>
        </div>

        <Field label={t('noteOptional')}>
          <textarea
            className={inputCls}
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('notePlaceholder')}
          />
        </Field>

        {error && (
          <p role="alert" className="rounded-xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-800">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={scanning || saving}
          className="flex min-h-[56px] w-full items-center justify-center rounded-2xl bg-maroon-800 text-base font-extrabold text-amber-100 disabled:opacity-60"
        >
          {saving ? t('saving') : t('save')}
        </button>
      </div>
    </div>
  );
}
