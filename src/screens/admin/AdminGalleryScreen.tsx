import { useMemo, useRef, useState } from 'react';
import { useLang } from '../../i18n';
import {
  currentAdmin,
  deleteGalleryPhoto,
  getGalleryPhotos,
  saveGalleryPhoto,
} from '../../data/mock';
import { downscaleImage } from '../../lib/receiptOcr';
import { ScreenHeader } from '../../components/ScreenHeader';

const inputCls =
  'w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 focus:border-amber-600 focus:outline-none';

/** Admin: upload / caption / delete gallery photos from the phone. */
export function AdminGalleryScreen() {
  const { t } = useLang();
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const photos = useMemo(() => getGalleryPhotos(), [refresh]);

  async function onPick(file: File) {
    setError('');
    setUploading(true);
    try {
      // Downscale on-device so the Firestore doc stays well under 1 MiB.
      const dataUrl = await downscaleImage(file, 1000, 0.75);
      await saveGalleryPhoto({ dataUrl, caption: caption.trim() || undefined }, currentAdmin()?.name);
      setCaption('');
      setRefresh((r) => r + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('tryAgain'));
    } finally {
      setUploading(false);
    }
  }

  async function confirmDelete() {
    if (!confirmDeleteId || deleting) return;
    setDeleting(true);
    try {
      await deleteGalleryPhoto(confirmDeleteId);
      setConfirmDeleteId(null);
      setRefresh((r) => r + 1);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="pb-24">
      <ScreenHeader title={t('gallery')} backTo="/admin/dashboard" />
      <div className="px-4 pt-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          aria-label={t('addPhoto')}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onPick(f);
            e.target.value = '';
          }}
        />
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <label className="block text-sm font-bold text-stone-800">
            {t('photoCaptionOptional')}
            <input
              className={`${inputCls} mt-1`}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={t('photoCaptionPlaceholder')}
              maxLength={80}
            />
          </label>
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="mt-3 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-maroon-800 text-base font-extrabold text-amber-100 disabled:opacity-60"
          >
            <span aria-hidden>📷</span>
            {uploading ? t('uploading') : t('addPhoto')}
          </button>
          <p className="mt-2 text-xs text-stone-400">{t('galleryUploadHint')}</p>
        </div>

        {error && (
          <p role="alert" className="mt-3 rounded-xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-800">
            {error}
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3">
          {photos.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <img src={p.dataUrl} alt={p.caption ?? ''} className="aspect-[3/4] w-full object-cover" loading="lazy" />
              <div className="flex items-center justify-between gap-2 p-2">
                <p className="min-w-0 flex-1 truncate text-xs font-semibold text-stone-600">
                  {p.caption || t('noCaption')}
                </p>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(p.id)}
                  className="min-h-[40px] shrink-0 rounded-xl bg-red-50 px-3 text-xs font-bold text-red-700"
                >
                  {t('delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
        {photos.length === 0 && (
          <p className="mt-4 rounded-2xl bg-white p-6 text-center text-sm text-stone-400 shadow-sm">
            {t('noPhotos')}
          </p>
        )}
      </div>

      {confirmDeleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
          role="dialog"
          aria-modal="true"
          aria-label={t('confirmDeletePhoto')}
        >
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
            <p className="text-base font-extrabold text-stone-900">{t('confirmDeletePhoto')}</p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                disabled={deleting}
                className="min-h-[52px] flex-1 rounded-2xl bg-stone-100 text-base font-bold text-stone-700 disabled:opacity-50"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="min-h-[52px] flex-1 rounded-2xl bg-red-600 text-base font-extrabold text-white disabled:opacity-50"
              >
                {deleting ? t('deleting') : t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
