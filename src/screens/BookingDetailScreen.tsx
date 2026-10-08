import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useLang } from '../i18n';
import {
  cancelBooking,
  currentAdmin,
  findBookingByCode,
  getSevas,
  getTempleProfile,
  isAdminAuthed,
  issueSevaReceipt,
} from '../data/mock';
import { downloadSevaReceiptPdf } from '../lib/sevaReceiptPdf';
import { ScreenHeader } from '../components/ScreenHeader';
import { fmtDate, fmtTime, toISODate, useLocalText } from '../components/text';

/** Booking confirmation + detail: QR code, details, cancel option. */
export function BookingDetailScreen() {
  const { t, lang } = useLang();
  const loc = useLocalText();
  const navigate = useNavigate();
  const { code } = useParams();
  const [cancelled, setCancelled] = useState(false);

  const booking = code ? findBookingByCode(code) : null;

  if (!booking) {
    return (
      <div className="pb-24">
        <ScreenHeader title={t('bookingId')} backTo="/bookings" />
        <p className="px-4 pt-8 text-center text-stone-500">{t('tryAgain')}</p>
      </div>
    );
  }

  const isCancelled = cancelled || booking.status === 'cancelled';
  const canCancel =
    !isCancelled && booking.status === 'confirmed' && booking.date >= toISODate(new Date());

  async function onCancel() {
    if (!booking) return;
    if (await cancelBooking(booking.id)) setCancelled(true);
  }

  async function onReceipt() {
    if (!booking) return;
    const receiptNo = await issueSevaReceipt(booking.id);
    if (!receiptNo) return;
    const profile = getTempleProfile();
    const seva = getSevas().find((s) => s.id === booking.sevaId);
    downloadSevaReceiptPdf({
      templeName: profile.name.en,
      templeAddress: profile.address,
      templePhone: profile.phone,
      receiptNo,
      date: fmtDate(booking.paidAt ?? new Date().toISOString().slice(0, 10), lang),
      devoteeName: booking.devoteeName,
      place: booking.place,
      phone: booking.phone,
      sevaName: loc(booking.sevaName),
      sevaDate: fmtDate(booking.date, lang),
      sevaTime: fmtTime(booking.time),
      amount: seva?.price ?? 0,
      collectedBy: booking.paidBy ?? currentAdmin()?.name ?? '',
      bookingCode: booking.bookingCode,
    });
  }

  const showReceipt = isAdminAuthed() && booking.paymentStatus === 'paid' && !isCancelled;

  return (
    <div className="pb-24">
      <ScreenHeader title={t('bookingConfirmed')} backTo="/bookings" />
      <div className="px-4 pt-3">
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
          <div className="mx-auto w-fit rounded-2xl border-4 border-maroon-800 p-2">
            <QRCodeSVG value={booking.bookingCode} size={192} aria-label={booking.bookingCode} />
          </div>
          <p className="mt-3 text-lg font-extrabold tracking-wider text-stone-900">
            {booking.bookingCode}
          </p>
          <p className="mt-1 text-sm text-stone-600">{t('showQrAtTemple')}</p>
          <p className="mt-1 text-sm font-semibold text-amber-800">{t('arriveEarly')}</p>
        </div>

        <dl className="mt-4 space-y-2 rounded-2xl bg-white p-4 shadow-sm text-[15px]">
          <div className="flex justify-between gap-3">
            <dt className="text-stone-500">{t('seva')}</dt>
            <dd className="text-right font-bold text-stone-900">{loc(booking.sevaName)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-stone-500">{t('chooseDateTime')}</dt>
            <dd className="text-right font-bold text-stone-900">
              {fmtDate(booking.date, lang)} · {fmtTime(booking.time)}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-stone-500">{t('fullName')}</dt>
            <dd className="text-right font-bold text-stone-900">{booking.devoteeName}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-stone-500">{t('phone')}</dt>
            <dd className="text-right font-bold text-stone-900">{booking.phone}</dd>
          </div>
          {booking.place && (
            <div className="flex justify-between gap-3">
              <dt className="text-stone-500">{t('place')}</dt>
              <dd className="text-right font-bold text-stone-900">{booking.place}</dd>
            </div>
          )}
          {booking.note && (
            <div className="flex justify-between gap-3">
              <dt className="text-stone-500">{t('note')}</dt>
              <dd className="text-right font-bold text-stone-900">{booking.note}</dd>
            </div>
          )}
          {booking.people != null && (
            <div className="flex justify-between gap-3">
              <dt className="text-stone-500">{t('numPeople')}</dt>
              <dd className="text-right font-bold text-stone-900">{booking.people}</dd>
            </div>
          )}
          <div className="flex justify-between gap-3">
            <dt className="text-stone-500">{t('status')}</dt>
            <dd
              className={`text-right font-bold ${
                isCancelled ? 'text-red-700' : 'text-emerald-700'
              }`}
            >
              {isCancelled ? t('cancelled') : t(booking.status as 'confirmed' | 'completed')}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-stone-500">{t('paymentStatus')}</dt>
            <dd
              className={`text-right font-bold ${
                booking.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {t(booking.paymentStatus)}
            </dd>
          </div>
        </dl>

        {showReceipt && (
          <button
            type="button"
            onClick={onReceipt}
            className="mt-4 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-white text-base font-bold text-maroon-800 shadow-sm ring-1 ring-stone-200"
          >
            <span aria-hidden>🧾</span> {t('receiptPdf')}
          </button>
        )}

        {canCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="mt-4 min-h-[52px] w-full rounded-2xl bg-white text-base font-bold text-red-700 shadow-sm"
          >
            {t('cancel')} {t('seva').toLowerCase()}
          </button>
        )}

        <Link
          to="/"
          className="mt-3 flex min-h-[52px] items-center justify-center rounded-2xl bg-maroon-800 text-base font-extrabold text-amber-100"
        >
          {t('home')}
        </Link>
        <button
          type="button"
          onClick={() => navigate('/bookings')}
          className="mt-3 min-h-[48px] w-full text-sm font-bold text-stone-600"
        >
          {t('myBookings')}
        </button>
      </div>
    </div>
  );
}
