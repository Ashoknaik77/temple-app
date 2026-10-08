import { useMemo, useState } from 'react';
import { useLang } from '../i18n';
import { getGalleryPhotos, getTempleProfile } from '../data/mock';
import { ScreenHeader } from '../components/ScreenHeader';

/** Devotee-facing photo gallery of the temple. */
export function GalleryScreen() {
  const { t } = useLang();
  const profile = getTempleProfile();
  const [lightbox, setLightbox] = useState<{ src: string; caption?: string } | null>(null);

  const items = useMemo(() => {
    const uploaded = getGalleryPhotos().map((p) => ({ src: p.dataUrl, caption: p.caption }));
    const bundled = profile.galleryUrls.map((url) => ({ src: url, caption: undefined as string | undefined }));
    return [...uploaded, ...bundled];
  }, [profile.galleryUrls]);

  return (
    <div className="pb-24">
      <ScreenHeader title={t('gallery')} backTo="/" />
      <div className="px-4 pt-3">
        {items.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="text-5xl" aria-hidden>
              🛕
            </p>
            <p className="mt-3 text-sm text-stone-500">{t('noPhotos')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setLightbox(item)}
                className="overflow-hidden rounded-2xl bg-white shadow-sm"
                aria-label={`${t('gallery')} ${i + 1}`}
              >
                <img src={item.src} alt={item.caption ?? ''} className="aspect-[3/4] w-full object-cover" loading="lazy" />
                {item.caption && (
                  <p className="truncate px-2 py-1.5 text-left text-xs font-semibold text-stone-600">
                    {item.caption}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox.src} alt={lightbox.caption ?? ''} className="max-h-[85%] max-w-full rounded-xl object-contain" />
          {lightbox.caption && (
            <p className="mt-3 text-center text-sm font-semibold text-white">{lightbox.caption}</p>
          )}
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-2xl text-white"
            aria-label={t('close')}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
